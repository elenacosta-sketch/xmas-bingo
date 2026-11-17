"""Create four blank, Christmas-themed 3x3 bingo cards on one A4 page."""
from pathlib import Path
from math import sin, cos, pi
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color, white
from reportlab.lib.pagesizes import A4
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'downloads/christmas-bingo-blank-3x3.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
c=canvas.Canvas(str(OUT),pagesize=A4)
c.setTitle('Christmas Bingo - Four Blank 3 x 3 Cards')
c.setAuthor('The Christmas Classroom')
W,H=A4
GREEN=HexColor('#24543E'); RED=HexColor('#AD3D35'); GOLD=HexColor('#B39450'); PALE=HexColor('#E5E9DC')
def star(x,y,r=5):
    p=c.beginPath()
    for i in range(10):
        a=pi/2+i*pi/5;rr=r if i%2==0 else r*.42
        (p.moveTo if i==0 else p.lineTo)(x+cos(a)*rr,y+sin(a)*rr)
    p.close();c.setFillColor(GOLD);c.drawPath(p,fill=1,stroke=0)
def leaf(x,y,a):
    c.saveState();c.translate(x,y);c.rotate(a);c.setFillColor(GREEN)
    p=c.beginPath();p.moveTo(0,0);p.curveTo(-9,3,-10,11,-6,15);p.lineTo(-3,13);p.lineTo(0,21);p.lineTo(3,13);p.lineTo(6,15);p.curveTo(10,11,9,3,0,0);c.drawPath(p,fill=1,stroke=0)
    c.setStrokeColor(HexColor('#55745A'));c.setLineWidth(.4);c.line(0,1,0,17);c.restoreState()
def holly(x,y):
    leaf(x,y,55);leaf(x,y,-55);leaf(x,y,0)
    c.setFillColor(RED)
    for dx,dy in [(-3,0),(3,0),(0,-5)]:c.circle(x+dx,y+dy,3.5,stroke=0,fill=1)
def tree(x,y):
    c.setFillColor(GOLD);c.rect(x-2,y,4,10,fill=1,stroke=0)
    for k,half in [(0,16),(1,12),(2,8)]:
        yy=y+5+k*9;p=c.beginPath();p.moveTo(x-half,yy);p.lineTo(x,yy+20);p.lineTo(x+half,yy);p.close();c.setFillColor(GREEN);c.drawPath(p,fill=1,stroke=0)
    star(x,y+45,4)
    c.setFillColor(RED)
    for dx,dy in [(-6,16),(4,23),(-2,32),(8,11)]:c.circle(x+dx,y+dy,1.5,fill=1,stroke=0)
def gift(x,y,w=20,h=18):
    c.setFillColor(RED);c.roundRect(x,y,w,h,2,fill=1,stroke=0);c.setFillColor(GOLD);c.rect(x+w*.43,y,w*.14,h,fill=1,stroke=0);c.rect(x,y+h*.58,w,h*.13,fill=1,stroke=0)
    c.setStrokeColor(GOLD);c.setLineWidth(1.2);c.ellipse(x+w*.2,y+h-1,x+w*.5,y+h+7,stroke=1,fill=0);c.ellipse(x+w*.5,y+h-1,x+w*.8,y+h+7,stroke=1,fill=0)
margin=25;gap=18;cw=(W-2*margin-gap)/2;ch=(H-2*margin-gap)/2
for row in range(2):
    for col in range(2):
        x=margin+col*(cw+gap);y=margin+(1-row)*(ch+gap)
        c.setStrokeColor(GREEN);c.setLineWidth(1.15);c.roundRect(x,y,cw,ch,11,fill=0,stroke=1)
        holly(x+31,y+ch-37);holly(x+cw-31,y+ch-37)
        c.setFillColor(RED);c.setFont('Times-BoldItalic',24);c.drawCentredString(x+cw/2,y+ch-36,'Christmas')
        c.setFillColor(GREEN);c.setFont('Helvetica-Bold',27);c.drawCentredString(x+cw/2,y+ch-67,'B I N G O')
        c.setFont('Helvetica',8);c.setFillColor(GREEN);c.drawString(x+17,y+ch-89,'Name:')
        c.setStrokeColor(PALE);c.setLineWidth(.7);c.line(x+46,y+ch-90,x+cw-17,y+ch-90)
        cellgap=5;size=(cw-34-2*cellgap)/3-8;left=x+(cw-3*size-2*cellgap)/2;top=y+ch-105
        c.setStrokeColor(GREEN);c.setLineWidth(.85)
        for r in range(3):
            for k in range(3):c.roundRect(left+k*(size+cellgap),top-size-r*(size+cellgap),size,size,4,fill=0,stroke=1)
        base=top-3*size-2*cellgap
        c.setFont('Helvetica',7);c.setFillColor(GREEN);c.drawCentredString(x+cw/2,base-16,'Write one Christmas word in each square.')
        c.drawCentredString(x+cw/2,base-27,'Listen, find the word, and cross it off!')
        tree(x+32,y+13);gift(x+cw-52,y+17,21,19);gift(x+cw-28,y+17,13,13)
        star(x+cw/2-31,y+23,4);star(x+cw/2+31,y+23,4)
        c.setFont('Times-Italic',12);c.setFillColor(RED);c.drawCentredString(x+cw/2,y+19,'Let it snow!')
# Discreet cutting guides between the four cards.
c.setDash(2,4);c.setLineWidth(.4);c.setStrokeColor(HexColor('#B7B7AD'));c.line(W/2,19,W/2,H-19);c.line(19,H/2,W-19,H/2);c.setDash()
c.showPage();c.save();print(OUT)
