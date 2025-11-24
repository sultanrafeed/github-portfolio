import re

# Read the current CSS
with open('style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Add profile picture styles before pot-body
profile_styles = '''/* Profile picture and name wrapper */
.profile-name-wrapper {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;
}

.profile-pic {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--primary-saffron);
    box-shadow: 0 4px 20px rgba(230, 126, 34, 0.3);
    animation: float-gentle 3s ease-in-out infinite;
}

@keyframes float-gentle {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

.name-section {
    flex: 1;
}

'''

# Find the pot-body position
pot_body_index = css.find('.pot-body {')
# Insert before pot-body
css = css[:pot_body_index] + profile_styles + css[pot_body_index:]

# Update pot-body with warm colors
css = re.sub(
    r'\.pot-body \{[^}]+\}',
    '''.pot-body {
    width: 300px;
    height: 200px;
    background: linear-gradient(180deg, #ff8c42 0%, #d2691e 50%, #a0522d 100%);
    border-radius: 0 0 150px 150px;
    position: relative;
    box-shadow: inset 0 -20px 40px rgba(139, 69, 19, 0.4);
}''',
    css,
    flags=re.DOTALL
)

# Update pot-rim with warm colors
css = re.sub(
    r'\.pot-rim \{[^}]+\}',
    '''.pot-rim {
    width: 320px;
    height: 40px;
    background: linear-gradient(180deg, #d2691e 0%, #a0522d 100%);
    border-radius: 20px;
    position: absolute;
    top: -20px;
    left: -10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}''',
    css,
    flags=re.DOTALL
)

# Update pot-lid with warm colors
css = re.sub(
    r'\.pot-lid \{[^}]+\}',
    '''.pot-lid {
    width: 300px;
    height: 80px;
    background: linear-gradient(180deg, #cd853f 0%, #a0522d 100%);
    border-radius: 150px 150px 0 0;
    position: absolute;
    top: -90px;
    left: 0;
    transform-origin: bottom right;
    animation: lid-wobble 4s ease-in-out infinite;
    box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
}''',
    css,
    flags=re.DOTALL
)

# Update steam with warm colors
css = re.sub(
    r'\.steam-line \{[^}]+\}',
    '''.steam-line {
    width: 12px;
    height: 80px;
    background: linear-gradient(to top, rgba(255, 200, 100, 0.7), rgba(255, 255, 255, 0.3));
    border-radius: 10px;
    filter: blur(10px);
    animation: steam-rise 2.5s infinite;
}''',
    css,
    flags=re.DOTALL
)

# Write back
with open('style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("CSS updated successfully!")
