import { Product } from '../../../models/types/product.types';

export interface ProductCardProps {
  product: Product;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}
