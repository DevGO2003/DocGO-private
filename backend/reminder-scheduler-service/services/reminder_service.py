from typing import Dict, List, Optional
from datetime import datetime, timezone

from schemas.reminder import Reminder, CreateReminderRequest, PageResult


class ReminderService:
    def __init__(self) -> None:
        self.reminders: Dict[str, Reminder] = {}

    def create_reminder(self, req: CreateReminderRequest) -> Reminder:
        rem = Reminder(
            contractId=req.contractId,
            type=req.type,
            dueAt=req.dueAt,
            recipients=req.recipients,
            channel=req.channel,
            note=req.note,
            createdBy=req.createdBy,
        )
        self.reminders[rem.id] = rem
        return rem

    def get_reminder(self, reminder_id: str) -> Optional[Reminder]:
        return self.reminders.get(reminder_id)

    def list_reminders(self, contract_id: Optional[str], status: Optional[str], page: int, size: int) -> PageResult:
        data: List[Reminder] = list(self.reminders.values())
        if contract_id:
            data = [r for r in data if r.contractId == contract_id]
        if status:
            data = [r for r in data if r.status == status]
        total = len(data)
        start = page * size
        end = start + size
        page_data = data[start:end]
        return PageResult(
            content=page_data,
            total_elements=total,
            total_pages=(total + size - 1) // size,
            page_number=page,
            page_size=size,
            number_of_elements=len(page_data),
        )

    def cancel_reminder(self, reminder_id: str) -> bool:
        r = self.reminders.get(reminder_id)
        if not r:
            return False
        r.status = "CANCELLED"
        return True

    def tick(self) -> int:
        now = datetime.now(timezone.utc)
        processed = 0
        for r in self.reminders.values():
            if r.status == "PENDING" and r.dueAt.replace(tzinfo=timezone.utc) <= now:
                r.status = "SENT"
                processed += 1
        return processed


