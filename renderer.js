const e = React.createElement;
const { useState, useEffect } = React;

function Sidebar({ page, setPage, total, selected }) {
  return e('div', { id: 'sidebar' },
    e('h3', null, '菜单'),
    e('div', {
      style: { cursor: 'pointer', fontWeight: page==='images'?'bold':'normal' },
      onClick: () => setPage('images')
    }, '图片管理'),
    e('div', {
      style: { cursor: 'pointer', fontWeight: page==='settings'?'bold':'normal' },
      onClick: () => setPage('settings')
    }, '参数设置'),
    e('div', { style: { position:'absolute', bottom:10 } }, `共${total}张 已选${selected}张`)
  );
}

function ImageManager({images,setImages,selected,setSelected}) {
  const [sel, setSel] = useState(selected);

  const addImages = async () => {
    const paths = await window.electronAPI?.openFiles?.();
    if(paths && paths.length) {
      setImages(imgs => [...imgs, ...paths.map(p=>({path:p, id:Date.now()+Math.random()}))]);
    }
  };

  const toggleSelect = (id) => {
    setSel(sel => {
      const newSel = sel.includes(id) ? sel.filter(i=>i!==id) : [...sel,id];
      setSelected(newSel);
      return newSel;
    });
  };

  const deleteSelected = () => {
    setImages(imgs => imgs.filter(img=>!sel.includes(img.id)));
    setSel([]);
    setSelected([]);
  };

  return e('div', {className:'card'},
    e('button',{onClick:addImages, className:'btn'},'增加图片'),
    e('button',{onClick:()=>{const ids=images.map(img=>img.id);setSel(ids);setSelected(ids);}, className:'btn'},'全选'),
    e('button',{onClick:()=>{setSel([]);setSelected([]);}, className:'btn'},'清空选择'),
    e('button',{onClick:deleteSelected, className:'btn'},'删除所选'),
    e('div',{id:'content', style:{display:'flex',flexWrap:'wrap'}},
      images.map(img=>e('img',{
        key:img.id,
        src:`file://${img.path}`,
        className:'thumbnail'+(sel.includes(img.id)?' selected':''),
        onClick:()=>toggleSelect(img.id)
      }))
    )
  );
}

function Settings({settings,setSettings,generate}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(s => ({ ...s, [name]: value }));
  };

  const save = () => {
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('已保存');
  };

  const load = () => {
    const d = localStorage.getItem('settings');
    if (d) setSettings(JSON.parse(d));
  };

  return e('div', { id: 'content', className:'card' },
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '输出宽度'),
      e('input', { type: 'number', name: 'width', value: settings.width, onChange: handleChange })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '标题文本'),
      e('input', { type: 'text', name: 'title', value: settings.title, onChange: handleChange })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '标题字体'),
      e('input', {
        type: 'file', accept: '.ttf,.otf',
        onChange: e => setSettings(s => ({ ...s, titleFontPath: e.target.files[0]?.path || '' }))
      })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '水印PNG'),
      e('input', {
        type: 'file', accept: 'image/png',
        onChange: e => setSettings(s => ({ ...s, watermarkPath: e.target.files[0]?.path || '' }))
      })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '位置'),
      e('select', { name: 'wmPos', value: settings.wmPos, onChange: handleChange },
        e('option', { value: 'lt' }, '左上'),
        e('option', { value: 'rt' }, '右上'),
        e('option', { value: 'lb' }, '左下'),
        e('option', { value: 'rb' }, '右下')
      )
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '水平边距'),
      e('input', { type: 'number', name: 'wmMarginX', value: settings.wmMarginX, onChange: handleChange })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '垂直边距'),
      e('input', { type: 'number', name: 'wmMarginY', value: settings.wmMarginY, onChange: handleChange })
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '水印缩放'),
      e('select', { name: 'wmScale', value: settings.wmScale, onChange: handleChange },
        e('option', { value: '0.25' }, '25%'),
        e('option', { value: '0.5' }, '50%'),
        e('option', { value: '0.75' }, '75%'),
        e('option', { value: '1' }, '100%')
      )
    ),
    e('div', {style:{marginBottom:'10px'}},
      e('label', null, '标题页高度'),
      e('input', { type: 'number', name: 'titleHeight', value: settings.titleHeight, onChange: handleChange })
    ),
    e('button', { onClick: save, className:'btn' }, '保存配置'),
    e('button', { onClick: load, className:'btn' }, '读取配置'),
    e('button', { onClick: generate, className:'btn' }, '生成PDF')
  );
}

function App(){
  const [page,setPage]=useState('images');
  const [images,setImages]=useState([]);
  const [selected,setSelected]=useState([]);
  const [settings,setSettings]=useState({
    width:1080,
    title:'标题',
    titleHeight:500,
    titleFontPath:'',
    watermarkPath:'',
    wmPos:'rb',
    wmMarginX:0,
    wmMarginY:0,
    wmScale:'0.5'
  });

  const generate = async () => {
    if (!images.length) { alert('请先选择图片'); return; }
    const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
    const fs = require('fs');
    const doc = await PDFDocument.create();
    let font;
    if (settings.titleFontPath) {
      const fBytes = fs.readFileSync(settings.titleFontPath);
      font = await doc.embedFont(fBytes);
    } else {
      font = await doc.embedFont(StandardFonts.Helvetica);
    }

    if (settings.title) {
      const page = doc.addPage([settings.width, parseInt(settings.titleHeight)]);
      const textWidth = font.widthOfTextAtSize(settings.title, 24);
      page.drawText(settings.title, {
        x: (settings.width - textWidth) / 2,
        y: settings.titleHeight / 2,
        size: 24,
        font,
        color: rgb(0, 0, 0)
      });
    }

    let wmEmbed;
    if (settings.watermarkPath) {
      const wmBytes = fs.readFileSync(settings.watermarkPath);
      wmEmbed = await doc.embedPng(wmBytes);
    }

    for (const img of images) {
      const bytes = fs.readFileSync(img.path);
      const ext = img.path.split('.').pop().toLowerCase();
      let embed;
      if (ext === 'png') embed = await doc.embedPng(bytes);
      else embed = await doc.embedJpg(bytes);
      const scale = settings.width / embed.width;
      const h = embed.height * scale;
      const page = doc.addPage([settings.width, h]);
      page.drawImage(embed, { x: 0, y: 0, width: settings.width, height: h });

      if (wmEmbed) {
        const wScale = parseFloat(settings.wmScale);
        const wmWidth = wmEmbed.width * wScale;
        const wmHeight = wmEmbed.height * wScale;
        let x = settings.wmMarginX;
        let y = h - wmHeight - settings.wmMarginY;
        if (settings.wmPos === 'rt') x = settings.width - wmWidth - settings.wmMarginX;
        else if (settings.wmPos === 'lb') y = settings.wmMarginY;
        else if (settings.wmPos === 'rb') {
          x = settings.width - wmWidth - settings.wmMarginX;
          y = settings.wmMarginY;
        }
        page.drawImage(wmEmbed, { x, y, width: wmWidth, height: wmHeight });
      }
    }

    const pdfBytes = await doc.save();
    const filePath = await window.electronAPI?.saveFile?.();
    if (filePath) {
      fs.writeFileSync(filePath, pdfBytes);
      alert('已导出');
    }
  };

  const selectedCount = selected.length;

  return e('div', null,
    e(Sidebar,{page,setPage,total:images.length,selected:selectedCount}),
    page==='images'
      ? e(ImageManager,{images,setImages,selected,setSelected})
      : e(Settings,{settings,setSettings,generate})
  );
}

ReactDOM.render(e(App), document.getElementById('app'));

