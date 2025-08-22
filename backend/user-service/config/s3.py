import boto3
import os
from dotenv import load_dotenv
from botocore.exceptions import ClientError
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'ap-southeast-1'),
            endpoint_url=os.getenv('S3_ENDPOINT_URL')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME', 'user-avatars')
    
    def upload_file(self, file_path: str, object_name: str) -> bool:
        """Upload a file to S3"""
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, object_name)
            logger.info(f"File {file_path} uploaded successfully to {object_name}")
            return True
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            return False
    
    def delete_file(self, object_name: str) -> bool:
        """Delete a file from S3"""
        try:
            self.s3_client.delete_object(Bucket=self.bucket_name, Key=object_name)
            logger.info(f"File {object_name} deleted successfully from S3")
            return True
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False
    
    def get_file_url(self, object_name: str) -> str:
        """Get public URL for a file"""
        try:
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{object_name}"
            return url
        except Exception as e:
            logger.error(f"Error generating file URL: {e}")
            return ""
    
    def file_exists(self, object_name: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError:
            return False

# Create global S3 service instance
s3_service = S3Service()
