import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from services.ai_processing_service import AutomationService

class TestAutomationService(unittest.TestCase):
    def test_initialization(self):
        service = AutomationService()
        self.assertIsNotNone(service)
        # Add more assertions if needed, but avoid API calls

if __name__ == '__main__':
    unittest.main()
