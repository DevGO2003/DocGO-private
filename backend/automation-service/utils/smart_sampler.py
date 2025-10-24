"""
Simple Document Sampler
Trích xuất đầu + giữa + cuối document (3-part balanced sampling)
Universal cho mọi loại document, nhanh và đơn giản
"""
from typing import Dict


class SmartSampler:
    """
    Simple 3-part document sampling
    - 40% head (tiêu đề, bên tham gia, opening)
    - 30% middle (nội dung chính)
    - 30% tail (kết thúc, chữ ký)
    """
    
    # Simple contract keywords for confidence scoring
    CONTRACT_KEYWORDS = {
        'vi': ['hợp đồng', 'bên a', 'bên b', 'điều', 'ký kết', 'thỏa thuận', 'cam kết'],
        'en': ['contract', 'agreement', 'party a', 'party b', 'article', 'signed', 'executed'],
    }
    
    @staticmethod
    def sample_three_parts(text: str, max_chars: int = 9000) -> Dict[str, any]:
        """
        Chia document thành 3 phần: đầu (40%) + giữa (30%) + cuối (30%)
        
        Args:
            text: Document text
            max_chars: Maximum characters to extract (default 9000)
        
        Returns:
            Dict with 'sample' (extracted text) and 'metadata' (info)
        """
        if len(text) <= max_chars:
            return {
                'sample': text,
                'metadata': {
                    'method': 'full_text',
                    'original_length': len(text),
                    'sample_length': len(text)
                }
            }
        
        # Calculate sizes for each part
        head_size = int(max_chars * 0.4)  # 3600 chars
        middle_size = int(max_chars * 0.3)  # 2700 chars
        tail_size = max_chars - head_size - middle_size  # 2700 chars
        
        # Extract parts
        head = text[:head_size]
        
        # Middle: center of document
        middle_start = (len(text) - middle_size) // 2
        middle = text[middle_start:middle_start + middle_size]
        
        tail = text[-tail_size:]
        
        # Combine with markers
        sample = f"{head}\n\n[... {len(text) - head_size - middle_size - tail_size} chars omitted from head ...]\n\n{middle}\n\n[... {len(text) - head_size - middle_size - tail_size} chars omitted from middle ...]\n\n{tail}"
        
        return {
            'sample': sample,
            'metadata': {
                'method': 'three_parts',
                'original_length': len(text),
                'sample_length': len(sample),
                'head_size': len(head),
                'middle_size': len(middle),
                'tail_size': len(tail)
            }
        }
    
    @staticmethod
    def get_contract_confidence(text: str) -> float:
        """
        Calculate confidence that document is a contract based on keywords
        Simple keyword matching for fallback
        
        Args:
            text: Document text (first 5000 chars checked)
        
        Returns:
            Confidence score 0.0 to 1.0
        """
        text_lower = text[:5000].lower()
        
        # Count Vietnamese keywords
        vi_matches = sum(1 for kw in SmartSampler.CONTRACT_KEYWORDS['vi'] if kw in text_lower)
        
        # Count English keywords
        en_matches = sum(1 for kw in SmartSampler.CONTRACT_KEYWORDS['en'] if kw in text_lower)
        
        total_matches = vi_matches + en_matches
        
        # Calculate confidence
        if total_matches >= 4:
            return 0.9  # High confidence
        elif total_matches >= 3:
            return 0.8  # Good confidence
        elif total_matches >= 2:
            return 0.6  # Medium confidence
        elif total_matches >= 1:
            return 0.4  # Low confidence
        else:
            return 0.1  # Very low confidence
