import os

def fix_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    fixed_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # if we see "import {\n" and the next line is "import { notify }...", we must swap them or remove it.
        # Actually the issue is that "import {\n" was supposed to be the last import, but my regex matched "import {"
        if line.strip() == "import {" and i + 1 < len(lines) and "import { notify }" in lines[i+1]:
            # swap them! The "import { notify }" should be BEFORE "import {" because "import {" is continuing.
            fixed_lines.append(lines[i+1])
            fixed_lines.append(line)
            i += 2
            continue
            
        fixed_lines.append(line)
        i += 1
        
    # Also if there's any `import { import { notify }`
    final_content = "".join(fixed_lines)
    final_content = final_content.replace("import { import { notify }", "import { notify }")
    final_content = final_content.replace("import {\nimport { notify }", "import { notify }\nimport {")

    with open(filepath, 'w') as f:
        f.write(final_content)

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            fix_file(os.path.join(root, file))

print("Fixed syntax errors")
