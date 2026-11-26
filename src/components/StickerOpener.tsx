import { useCallback } from 'react';
import type { Attachment } from '../types';
import { useMedia } from '../lib/storage';
import { Modal } from './Modal';
export function StickerOpener({attachment,onClose}:{attachment:Attachment;onClose:()=>void}){const url=useMedia(attachment.assetId);const close=useCallback(onClose,[onClose]);return <Modal title="스티커 속 이야기" onClose={close}>{attachment.kind==='text'?<div className="attachment-text">{attachment.text}</div>:url?attachment.kind==='photo'?<img className="attachment-image" src={url} alt="스티커에 연결된 사진"/>:<video className="attachment-image" src={url} controls playsInline/>:<p>첨부 파일을 불러올 수 없어요.</p>}</Modal>;}
