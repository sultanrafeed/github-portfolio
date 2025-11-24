import re

# Read the current HTML
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Define the old hero-left section pattern
old_pattern = r'(\s*<div class="hero-left">)\s*<h1 class="brand-name">Rafeed<br>Mohammad<br>Sultan</h1>\s*<p class="brand-subtitle">AI Researcher & Software Chef</p>\s*<a href="#contact" class="menu-btn">Order Now</a>'

#Define the replacement
new_section = r'''            <div class="hero-left">
                <div class="profile-name-wrapper">
                    <img src="profile.png" alt="Rafeed Mohammad Sultan" class="profile-pic">
                    <div class="name-section">
                        <h1 class="brand-name">Rafeed<br>Mohammad<br>Sultan</h1>
                        <p class="brand-subtitle">AI Researcher & Software Chef</p>
                    </div>
                </div>
                <a href="#contact" class="menu-btn">Order Now</a>'''

# Replace the section
html_new = re.sub(old_pattern, new_section, html, flags=re.DOTALL)

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_new)

print("HTML updated successfully!")
