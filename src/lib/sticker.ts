// IMG.LY runs inference locally. Only model/runtime assets are downloaded.
export async function cutoutSticker(file: File, progress: (message: string) => void): Promise<File> {
 if (!file.type.startsWith('image/')) throw new Error('이미지 파일을 선택해주세요.');
 if (file.size > 20 * 1024 * 1024) throw new Error('20MB 이하의 파일을 선택해주세요.');
 progress('이미지 준비 중…');
 const bitmap = await createImageBitmap(file);
 const scale = Math.min(1, 1536 / Math.max(bitmap.width, bitmap.height));
 const canvas = document.createElement('canvas');
 canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
 const ctx = canvas.getContext('2d')!; ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
 const png = (c: HTMLCanvasElement) => new Promise<Blob>((resolve,reject) => c.toBlob(b => b ? resolve(b) : reject(new Error('이미지를 변환하지 못했어요.')), 'image/png'));
 const input = await png(canvas);
 const { removeBackground } = await import('@imgly/background-removal');
 progress('배경 제거 중…');
 const result = await removeBackground(input, {model:'isnet_quint8',device:'cpu',proxyToWorker:true,output:{format:'image/png'},progress:(key,current,total)=>{
  progress(key.startsWith('fetch:') && current < total ? '배경 제거 모델 준비 중…' : '배경 제거 중…');
 }});
 const foreground = await createImageBitmap(result); canvas.width=foreground.width;canvas.height=foreground.height;ctx.drawImage(foreground,0,0);foreground.close();
 const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
 for(let y=0;y<canvas.height;y++) for(let x=0;x<canvas.width;x++) if(data[(y*canvas.width+x)*4+3]>12){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<0) throw new Error('피사체를 찾지 못했어요. 다른 이미지를 선택해주세요.');
 const cropped=document.createElement('canvas');const pad=8;cropped.width=right-left+1+pad*2;cropped.height=bottom-top+1+pad*2;
 cropped.getContext('2d')!.drawImage(canvas,left,top,right-left+1,bottom-top+1,pad,pad,right-left+1,bottom-top+1);
 return new File([await png(cropped)],'sticker.png',{type:'image/png'});
}
