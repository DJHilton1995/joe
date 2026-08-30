import os
import base64
import requests
from typing import Optional

AUTOMATIC1111_URL = os.environ.get('AUTOMATIC1111_URL', 'http://127.0.0.1:7860')


def generate_image(prompt: str, width: int = 512, height: int = 768, steps: int = 28, style: Optional[str] = None):
    request_url = f'{AUTOMATIC1111_URL}/sdapi/v1/txt2img'
    payload = {
        'prompt': prompt,
        'negative_prompt': 'blurry, distorted, low quality',
        'width': width,
        'height': height,
        'sampler_name': 'Euler a',
        'steps': steps,
        'batch_size': 1,
        'cfg_scale': 7.5,
    }
    if style:
        payload['prompt'] = f'{style}, {prompt}'

    response = requests.post(request_url, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()
    if 'images' not in data or not data['images']:
        raise RuntimeError('No image returned')
    return base64.b64decode(data['images'][0])


def build_joey_avatar_prompt(style: str = 'clothed', mood: str = 'confident') -> str:
    clothing = 'wearing sleek casual clothes' if style == 'clothed' else 'wearing stylish underwear with tasteful cover'
    return (
        f'3D animated Joey avatar, realistic mouth movements, dynamic gestures, {clothing}, '
        f'multilingual scientist persona, confident and expressive, inspired by provided PNG and MP4 style.'
    )
