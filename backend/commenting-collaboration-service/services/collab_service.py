from typing import Dict, List, Optional
from datetime import datetime

from schemas.collab import (
    Thread, CreateThreadRequest, UpdateThreadRequest,
    Comment, CreateCommentRequest, UpdateCommentRequest,
    PageResult,
)


class CollaborationService:
    def __init__(self) -> None:
        self.threads: Dict[str, Thread] = {}
        self.comments: Dict[str, Comment] = {}

    # Threads
    def create_thread(self, req: CreateThreadRequest) -> Thread:
        thread = Thread(
            contractId=req.contractId,
            title=req.title,
            createdBy=req.createdBy,
            participants=req.participants or [],
        )
        self.threads[thread.id] = thread
        return thread

    def list_threads(self, contract_id: Optional[str], created_by: Optional[str], page: int, size: int, sort_by: Optional[str], sort_dir: Optional[str]) -> PageResult:
        data = list(self.threads.values())
        if contract_id:
            data = [t for t in data if t.contractId == contract_id]
        if created_by:
            data = [t for t in data if t.createdBy == created_by]
        total_elements = len(data)
        start = page * size
        end = start + size
        page_data = data[start:end]
        return PageResult(
            content=page_data,
            total_elements=total_elements,
            total_pages=(total_elements + size - 1) // size,
            page_number=page,
            page_size=size,
            number_of_elements=len(page_data),
        )

    def get_thread(self, thread_id: str) -> Optional[Thread]:
        return self.threads.get(thread_id)

    def update_thread(self, thread_id: str, req: UpdateThreadRequest) -> Optional[Thread]:
        th = self.threads.get(thread_id)
        if not th:
            return None
        if req.title is not None:
            th.title = req.title
        if req.participants is not None:
            th.participants = req.participants
        th.updatedAt = datetime.utcnow()
        return th

    def delete_thread(self, thread_id: str) -> bool:
        th = self.threads.get(thread_id)
        if not th:
            return False
        th.deletedAt = datetime.utcnow()
        return True

    # Comments
    def create_comment(self, thread_id: str, req: CreateCommentRequest) -> Optional[Comment]:
        th = self.threads.get(thread_id)
        if not th:
            return None
        cm = Comment(
            threadId=thread_id,
            content=req.content,
            authorId=req.actorId or "unknown",
            attachments=req.attachments or [],
            mentionedUserIds=req.mentionedUserIds or [],
        )
        self.comments[cm.id] = cm
        th.totalComments += 1
        th.lastMessageAt = datetime.utcnow()
        return cm

    def list_comments(self, thread_id: str, page: int, size: int, sort_by: Optional[str], sort_dir: Optional[str]) -> PageResult:
        data: List[Comment] = [c for c in self.comments.values() if c.threadId == thread_id]
        total_elements = len(data)
        start = page * size
        end = start + size
        page_data = data[start:end]
        return PageResult(
            content=page_data,
            total_elements=total_elements,
            total_pages=(total_elements + size - 1) // size,
            page_number=page,
            page_size=size,
            number_of_elements=len(page_data),
        )

    def update_comment(self, comment_id: str, req: UpdateCommentRequest) -> Optional[Comment]:
        cm = self.comments.get(comment_id)
        if not cm:
            return None
        cm.editHistory.append({
            "editedAt": datetime.utcnow(),
            "editorId": req.actorId or cm.authorId,
            "before": cm.content,
            "after": req.content,
        })
        cm.content = req.content
        cm.updatedAt = datetime.utcnow()
        return cm

    def delete_comment(self, comment_id: str) -> bool:
        cm = self.comments.get(comment_id)
        if not cm:
            return False
        cm.deletedAt = datetime.utcnow()
        return True


