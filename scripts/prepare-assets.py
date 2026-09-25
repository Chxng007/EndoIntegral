import sys
from pathlib import Path
sys.path.insert(0,str(Path('.tools/python').resolve()))
import pymupdf as fitz
from PIL import Image, ImageOps, ImageDraw
root=Path('artifacts/references')
for start in range(1,23,6):
    sheet=Image.new('RGB',(1440,2100),'#ddd')
    for j,n in enumerate(range(start,min(start+6,23))):
        im=Image.open(root/f'doc-2-page-{n}.png')
        im.thumbnail((700,665))
        x=(j%2)*720; y=(j//2)*700
        sheet.paste(im,(x,y+25))
        ImageDraw.Draw(sheet).text((x+15,y+5),f'PAGINA {n}', fill='black')
    sheet.save(root/f'sheet-{start}.jpg')
doc=fitz.open('C:/Users/innovacion/Downloads/página web.pdf')
for p in [0,1,15]:
    for i,img in enumerate(doc[p].get_images(full=True)):
        raw=doc.extract_image(img[0])
        path=Path('artifacts/references')/f'asset-{p+1}-{i}.{raw["ext"]}'
        path.write_bytes(raw['image'])
        print(path, raw['width'], raw['height'])
doc=fitz.open('C:/Users/innovacion/Downloads/Yoga_Terapia_Endometriosis_Posturas_y_Videos.pdf')
raw=doc.extract_image(doc[0].get_images(full=True)[0][0])
Path('public/img/yoga-guide.png').write_bytes(raw['image'])
