import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("device_id")
    parser.add_argument("--keys-dir", required=True)
    parser.add_argument("--register", required=True)
    args = parser.parse_args()
    print(f"Device {args.device_id} registered at {args.register} with keys in {args.keys_dir}")
