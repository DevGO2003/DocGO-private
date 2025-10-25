import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.ai_clients import GeminiClient

class TestGeminiClient(unittest.TestCase):
    def setUp(self):
        self.client = GeminiClient()

    def test_initialization(self):
        self.assertIsNotNone(self.client.model)
        self.assertIsNotNone(self.client.current_model_name)

    def test_generate_content(self):
        response = self.client.generate_content("Hello")
        self.assertIsNotNone(response)
        self.assertTrue(len(response) > 0)

if __name__ == '__main__':
    unittest.main()
