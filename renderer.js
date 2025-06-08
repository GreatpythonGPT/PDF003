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

function ImageManager({images,setImages}) {
  const [sel, setSel] = useState([]);

  const addImages = async () => {
    const paths = await window.electronAPI?.openFiles?.();
    if(paths && paths.length) {
      setImages(imgs => [...imgs, ...paths.map(p=>({path:p, id:Date.now()+Math.random()}))]);
    }
  };

  const toggleSelect = (id) => {
    setSel(sel => sel.includes(id) ? sel.filter(i=>i!==id) : [...sel,id]);
  };

  const deleteSelected = () => {
    setImages(imgs => imgs.filter(img=>!sel.includes(img.id)));
    setSel([]);
  };

  return e('div', null,
    e('button',{onClick:addImages},'增加图片'),
    e('button',{onClick:()=>setSel(images.map(img=>img.id))},'全选'),
    e('button',{onClick:()=>setSel([])},'清空选择'),
    e('button',{onClick:deleteSelected},'删除所选'),
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
  const handleChange=(e)=>{
    const {name,value} = e.target;
    setSettings(s=>({...s,[name]:value}));
  };
  const save=()=>{
    localStorage.setItem('settings',JSON.stringify(settings));
    alert('已保存');
  };
  const load=()=>{
    const d=localStorage.getItem('settings');
    if(d) setSettings(JSON.parse(d));
  };
  return e('div',{id:'content'},
    e('div',null,
      e('label',null,'输出宽度'),
      e('input',{type:'number',name:'width',value:settings.width,onChange:handleChange})
    ),
    e('div',null,
      e('label',null,'标题文本'),
      e('input',{type:'text',name:'title',value:settings.title,onChange:handleChange})
    ),
    e('button',{onClick:save},'保存配置'),
    e('button',{onClick:load},'读取配置'),
    e('button',{onClick:generate},'生成PDF')
  );
}

function App(){
  const [page,setPage]=useState('images');
  const [images,setImages]=useState([]);
  const [settings,setSettings]=useState({width:1080,title:'标题'});

  const generate=async()=>{
    if(!images.length){alert('请先选择图片'); return;}
    const { PDFDocument, StandardFonts } = require('pdf-lib');
    const fs = require('fs');
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    if(settings.title){
      const page = doc.addPage([settings.width, parseInt(settings.width/2)]);
      page.drawText(settings.title, { x:50, y:page.getHeight()-100, size:24, font });
    }
    for(const img of images){
      const bytes = fs.readFileSync(img.path);
      const ext = img.path.split('.').pop().toLowerCase();
      let embed;
      if(ext==='png') embed = await doc.embedPng(bytes);
      else embed = await doc.embedJpg(bytes);
      const scale = settings.width / embed.width;
      const page = doc.addPage([settings.width, embed.height*scale]);
      page.drawImage(embed,{x:0,y:0,width:settings.width,height:embed.height*scale});
    }
    const pdfBytes = await doc.save();
    const filePath = await window.electronAPI?.saveFile?.();
    if(filePath){
      fs.writeFileSync(filePath, pdfBytes);
      alert('已导出');
    }
  };

  const selectedCount = 0; // simplification

  return e('div', null,
    e(Sidebar,{page,setPage,total:images.length,selected:selectedCount}),
    page==='images'
      ? e(ImageManager,{images,setImages})
      : e(Settings,{settings,setSettings,generate})
  );
}

ReactDOM.render(e(App), document.getElementById('app'));

