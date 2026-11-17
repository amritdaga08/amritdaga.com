#!/usr/bin/env python3
"""Rebuild play/plate/index.html from the live Plate app source, sanitised for the public demo.
Usage: python3 tools/sync-plate.py /path/to/plate.html
No personal data: the claude runtime is disabled, targets are generic, personal names are stripped."""
import re, sys
app = open(sys.argv[1]).read()
out = 'play/plate/index.html'
cur = open(out).read()
head = re.search(r'<head>\n(<script>try\{Object\.defineProperty.*?</script>)\n', cur, re.S).group(1)
s = app
s = s.replace('<head>\n', '<head>\n' + head + '\n', 1)
s = s.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '')
s = re.sub(r'(<title>Plate</title>\n)', r'\1<link rel="icon" href="../../favicon-32.png">\n', s, 1)
s = s.replace('const TARGET = {kcal:1750, protein:155, floor:144};', 'const TARGET = {kcal:1800, protein:150, floor:140};')
s = s.replace(" (Pooja)", "").replace("Pooja's dishes", "home-cooked dishes").replace("Pooja", "home")
assert "Pooja" not in s and "amrit" not in s.lower().replace("amritdaga","")
open(out, 'w').write(s)
print("synced", len(s))
