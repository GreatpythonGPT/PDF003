import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  Checkbox,
  Stack
} from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface ImageItem {
  id: string;
  path: string;
  selected: boolean;
}

function App() {
  const [page, setPage] = useState<'images' | 'params' | 'export'>('images');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [width, setWidth] = useState(1000);
  const [topLabel, setTopLabel] = useState('');
  const [bottomLabel, setBottomLabel] = useState('');
  const [title, setTitle] = useState('');

  const handleAddImages = async () => {
    const files = await window.api.selectImages();
    const newItems = files.map((p) => ({ id: p + Math.random(), path: p, selected: false }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleSelectAll = () => {
    setImages((imgs) => imgs.map((i) => ({ ...i, selected: true })));
  };

  const handleClearSelection = () => {
    setImages((imgs) => imgs.map((i) => ({ ...i, selected: false })));
  };

  const handleDeleteSelected = () => {
    setImages((imgs) => imgs.filter((i) => !i.selected));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setImages(reordered);
  };

  const handleGenerate = async () => {
    await window.api.savePDF({ images: images.map((i) => i.path), width, topLabel, bottomLabel, title });
  };

  const drawer = (
    <List>
      <ListItemButton selected={page === 'images'} onClick={() => setPage('images')}><ListItemText primary="图片排序" /></ListItemButton>
      <ListItemButton selected={page === 'params'} onClick={() => setPage('params')}><ListItemText primary="参数调整" /></ListItemButton>
      <ListItemButton selected={page === 'export'} onClick={() => setPage('export')}><ListItemText primary="生成 PDF" /></ListItemButton>
    </List>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">PDF 生成器</Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" sx={{ width: 200, [`& .MuiDrawer-paper`]: { width: 200 } }}>
        <Toolbar />
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: 25 }}>
        <Toolbar />
        {page === 'images' && (
          <Box>
            <Stack direction="row" spacing={1} mb={2}>
              <Button variant="contained" onClick={handleAddImages}>添加图片</Button>
              <Button onClick={handleSelectAll}>全选</Button>
              <Button onClick={handleClearSelection}>清空选择</Button>
              <Button onClick={handleDeleteSelected}>删除所选</Button>
            </Stack>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="list" direction="vertical">
                {(provided) => (
                  <Grid container spacing={2} {...provided.droppableProps} ref={provided.innerRef}>
                    {images.map((img, index) => (
                      <Draggable draggableId={img.id} index={index} key={img.id}>
                        {(dragProvided) => (
                          <Grid item xs={12} md={6} lg={4} ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                            <Paper sx={{ position: 'relative', p:1 }}>
                              <img src={`file://${img.path}`} alt="" style={{ width: '100%' }} onClick={() => setImages((imgs) => imgs.map(i => i.id===img.id?{...i, selected: !i.selected}:i))} />
                              <Checkbox checked={img.selected} sx={{ position: 'absolute', top: 0, left: 0 }} onChange={() => setImages((imgs) => imgs.map(i => i.id===img.id?{...i, selected: !i.selected}:i))} />
                            </Paper>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Grid>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        )}
        {page === 'params' && (
          <Stack spacing={2} maxWidth={400}>
            <TextField label="目标宽度" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} />
            <TextField label="左上标注" value={topLabel} onChange={(e) => setTopLabel(e.target.value)} />
            <TextField label="右下标注" value={bottomLabel} onChange={(e) => setBottomLabel(e.target.value)} />
            <TextField label="标题页标题" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Stack>
        )}
        {page === 'export' && (
          <Box>
            <Typography>共 {images.length} 张图片</Typography>
            <Button variant="contained" onClick={handleGenerate}>生成 PDF</Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
