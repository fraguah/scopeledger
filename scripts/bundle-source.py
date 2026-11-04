from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path(__file__).resolve().parents[1]
out=root/'public'/'source.zip';out.parent.mkdir(exist_ok=True)
paths=[root/p for p in ('package.json','package-lock.json','index.html','vite.config.js','README.md','LICENSE')]
for folder in ('src','contracts','tests','scripts','docs'):
    paths.extend(p for p in (root/folder).rglob('*') if p.is_file() and '__pycache__' not in p.parts)
with ZipFile(out,'w',ZIP_DEFLATED) as z:
    for p in sorted(paths):
        if p.exists():z.write(p,'scopeledger/'+str(p.relative_to(root)))
print('Source archive prepared without credentials.')
