import os
from typing import Optional

import boto3
from botocore.client import Config
from dotenv import load_dotenv


load_dotenv()  # Load variables from .env if present


def get_env(name: str, default: Optional[str] = None) -> Optional[str]:
	"""Read environment variable with a default value."""
	return os.getenv(name, default)


# S3 / Filebase configuration
S3_ENDPOINT: str = get_env("S3_ENDPOINT", "https://s3.filebase.com")
S3_REGION: str = get_env("S3_REGION", "us-east-1")
S3_ACCESS_KEY_ID: str = get_env("S3_ACCESS_KEY_ID", "minioadmin")
S3_SECRET_ACCESS_KEY: str = get_env("S3_SECRET_ACCESS_KEY", "miniopassword")
S3_BUCKET: str = get_env("S3_BUCKET", "docgo-assets")

s3_client = boto3.client(
	"s3",
	endpoint_url=S3_ENDPOINT,
	aws_access_key_id=S3_ACCESS_KEY_ID,
	aws_secret_access_key=S3_SECRET_ACCESS_KEY,
	region_name=S3_REGION,
	config=Config(signature_version="s3v4"),
)


# Optional IPFS (Filebase RPC) configuration
IPFS_RPC_ENDPOINT: str = get_env("IPFS_RPC_ENDPOINT", "https://rpc.filebase.io")
IPFS_RPC_TOKEN: Optional[str] = get_env("IPFS_RPC_TOKEN")


def get_presigned_get_url(object_key: str, expires_in_seconds: int = 3600) -> str:
	"""Generate a presigned GET URL for the given S3 key."""
	return s3_client.generate_presigned_url(
		"get_object",
		Params={"Bucket": S3_BUCKET, "Key": object_key},
		ExpiresIn=expires_in_seconds,
	)

def get_s3_client():
	"""Get S3 client instance."""
	return s3_client

def get_bucket_name() -> str:
	"""Get S3 bucket name."""
	return S3_BUCKET

def get_s3_endpoint() -> str:
	"""Get S3 endpoint URL."""
	return S3_ENDPOINT

def get_s3_region() -> str:
	"""Get S3 region."""
	return S3_REGION

# ClamAV configuration
CLAMD_HOST: str = get_env("CLAMD_HOST", "localhost")
CLAMD_PORT: int = int(get_env("CLAMD_PORT", "3310"))
USE_CLAMD: bool = get_env("USE_CLAMD", "true").lower() == "true"

# File storage configuration
MAX_FILE_SIZE: int = int(get_env("MAX_FILE_SIZE", "104857600"))  # 100MB default
ALLOWED_FILE_TYPES: list = get_env("ALLOWED_FILE_TYPES", "pdf,docx,txt,jpg,jpeg,png,gif").split(",")
UPLOAD_DIR: str = get_env("UPLOAD_DIR", "uploads")
TEMP_DIR: str = get_env("TEMP_DIR", "temp")


