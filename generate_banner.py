from PIL import Image, ImageDraw, ImageFont
import math

# Create a banner image
width = 1400
height = 400
image = Image.new('RGB', (width, height), color='#000000')
draw = ImageDraw.Draw(image)

# Color scheme - black, white, red (consistent with portfolio)
black = '#000000'
white = '#ffffff'
red = '#ff0000'
gray = '#999999'
dark_gray = '#333333'

# Try bold, modern fonts for main title
name_fonts_to_try = [
    ("C:\\Windows\\Fonts\\segoeuib.ttf", 36),         # Segoe UI Bold
    ("C:\\Windows\\Fonts\\ariblk.ttf", 36),           # Arial Black
    ("C:\\Windows\\Fonts\\calibrib.ttf", 36),         # Calibri Bold
    ("C:\\Windows\\Fonts\\segoeui.ttf", 36),          # Fallback
]

# Try thin, elegant fonts for subtitle - spacey and minimal
cursive_fonts_to_try = [
    ("C:\\Windows\\Fonts\\segoeuil.ttf", 20),         # Segoe UI Light
    ("C:\\Windows\\Fonts\\segoeuisl.ttf", 20),        # Segoe UI Semilight
    ("C:\\Windows\\Fonts\\calibril.ttf", 20),         # Calibri Light
    ("C:\\Windows\\Fonts\\segoeui.ttf", 20),          # Segoe UI Regular
    ("C:\\Windows\\Fonts\\arial.ttf", 20),            # Arial Regular
]

# Small thin font for secondary text
small_cursive_fonts_to_try = [
    ("C:\\Windows\\Fonts\\segoeuil.ttf", 16),         # Segoe UI Light
    ("C:\\Windows\\Fonts\\calibril.ttf", 16),         # Calibri Light
    ("C:\\Windows\\Fonts\\segoeui.ttf", 16),          # Segoe UI Regular
]

# Load name font
font_name = None
for font_path, size in name_fonts_to_try:
    try:
        font_name = ImageFont.truetype(font_path, size)
        break
    except:
        continue

if font_name is None:
    try:
        font_name = ImageFont.truetype("C:\\Windows\\Fonts\\calibrib.ttf", 48)
    except:
        font_name = ImageFont.load_default()

# Load cursive subtitle font
font_subtitle = None
for font_path, size in cursive_fonts_to_try:
    try:
        font_subtitle = ImageFont.truetype(font_path, size)
        break
    except:
        continue

if font_subtitle is None:
    try:
        font_subtitle = ImageFont.truetype("C:\\Windows\\Fonts\\BRUSHSCI.TTF", 24)
    except:
        font_subtitle = ImageFont.load_default()

# Load small cursive font
font_small_cursive = None
for font_path, size in small_cursive_fonts_to_try:
    try:
        font_small_cursive = ImageFont.truetype(font_path, size)
        break
    except:
        continue

if font_small_cursive is None:
    font_small_cursive = font_subtitle

# Code font
try:
    font_code = ImageFont.truetype("C:\\Windows\\Fonts\\consola.ttf", 13)
except:
    font_code = ImageFont.load_default()

# Draw complex geometric structure on the left
def rotate_point(point, angle_x, angle_y, angle_z):
    """Rotate a 3D point around all three axes"""
    x, y, z = point

    # Rotate around Z
    x_new = x * math.cos(angle_z) - y * math.sin(angle_z)
    y_new = x * math.sin(angle_z) + y * math.cos(angle_z)
    x, y = x_new, y_new

    # Rotate around Y
    x_new = x * math.cos(angle_y) - z * math.sin(angle_y)
    z_new = x * math.sin(angle_y) + z * math.cos(angle_y)
    x, z = x_new, z_new

    # Rotate around X
    y_new = y * math.cos(angle_x) - z * math.sin(angle_x)
    z_new = y * math.sin(angle_x) + z * math.cos(angle_x)
    y, z = y_new, z_new

    return (x, y, z)

def project_3d_to_2d(point, center_x, center_y, scale):
    """Project 3D point to 2D"""
    x, y, z = point
    # Simple perspective projection
    factor = 1 / (1 + z * 0.1)
    px = center_x + x * scale * factor
    py = center_y + y * scale * factor
    return (px, py)

# Draw multiple overlapping cubes for complexity
cube_configs = [
    {'center': (120, 150), 'size': 50, 'angles': (0.3, 0.5, 0.2), 'color': red},
    {'center': (160, 180), 'size': 40, 'angles': (0.5, 0.3, 0.4), 'color': white},
    {'center': (140, 165), 'size': 30, 'angles': (0.2, 0.6, 0.1), 'color': red},
]

for config in cube_configs:
    center_x, center_y = config['center']
    cube_size = config['size']
    angle_x, angle_y, angle_z = config['angles']
    color = config['color']

    # Define cube vertices
    vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ]

    # Rotate and project
    rotated = []
    for v in vertices:
        rotated_point = rotate_point(v, angle_x, angle_y, angle_z)
        projected = project_3d_to_2d(rotated_point, center_x, center_y, cube_size)
        rotated.append(projected)

    # Draw edges
    edges = [
        (0, 1), (1, 2), (2, 3), (3, 0),
        (4, 5), (5, 6), (6, 7), (7, 4),
        (0, 4), (1, 5), (2, 6), (3, 7)
    ]

    for edge in edges:
        start = rotated[edge[0]]
        end = rotated[edge[1]]
        draw.line([start, end], fill=color, width=2)

    # Draw inner diagonals for more complexity
    inner_edges = [(0, 6), (1, 7), (2, 4), (3, 5)]
    for edge in inner_edges:
        start = rotated[edge[0]]
        end = rotated[edge[1]]
        draw.line([start, end], fill=color, width=1)

# Draw connecting lines between cubes
draw.line([(120, 150), (160, 180)], fill=dark_gray, width=1)
draw.line([(160, 180), (140, 165)], fill=dark_gray, width=1)

# C++ Code snippet
code_y = 230
code_lines = [
    ("#include", " <iostream>"),
    ("class", " Creator {"),
    ("  ", "private", ":"),
    ("    ", "bool", " passion = ", "true", ";"),
    ("    std::vector<", "int", "> projects;"),
    ("  ", "public", ":"),
    ("    ", "void", " build() {"),
    ("      ", "while", "(passion) {"),
    ("        code();"),
    ("        deploy();"),
    ("      }"),
    ("    }"),
    ("};"),
]

for i, line in enumerate(code_lines):
    x_pos = 40
    if isinstance(line, tuple):
        for segment in line:
            if segment in ["#include", "class", "private", "public", "bool", "void", "while", "int"]:
                color = red
            elif segment in ["Creator", "passion", "true", "projects"]:
                color = white
            else:
                color = gray

            draw.text((x_pos, code_y + i*18), segment, fill=color, font=font_code)
            bbox = draw.textbbox((0, 0), segment, font=font_code)
            x_pos += (bbox[2] - bbox[0])
    else:
        draw.text((40, code_y + i*18), line, fill=gray, font=font_code)

# Main content area
content_x = 360

# Helper function to draw text with letter spacing
def draw_text_with_spacing(draw, pos, text, fill, font, spacing=3):
    x, y = pos
    for char in text:
        draw.text((x, y), char, fill=fill, font=font)
        bbox = draw.textbbox((0, 0), char, font=font)
        x += (bbox[2] - bbox[0]) + spacing
    return x

# Top accent line
draw.rectangle([(content_x, 140), (1300, 141)], fill=red)

# Main title - GAME DEVELOPMENT
title_y = 170
main_title = "GAME DEVELOPMENT"
for offset in range(3, 0, -1):
    draw.text((content_x + offset, title_y + offset), main_title, fill=dark_gray, font=font_name)
draw.text((content_x, title_y), main_title, fill=white, font=font_name)

# Tagline below
tagline_y = 220
draw_text_with_spacing(draw, (content_x, tagline_y), "c++  |  unreal  |  graphics", red, font_subtitle, spacing=3)

# Bottom accent line
draw.rectangle([(content_x, 260), (900, 261)], fill=red)

# Save the image
image.save('banner.png')
print("Banner created successfully: banner.png")
