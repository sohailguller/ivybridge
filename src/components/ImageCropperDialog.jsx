import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, X, ZoomIn, ZoomOut, Sun, Contrast } from "lucide-react";

export default function ImageCropperDialog({ open, onOpenChange, imageFile, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImageSrc(e.target.result);
          // Calculate initial zoom to fit image in canvas
          const canvasSize = 300;
          const minDimension = Math.min(img.width, img.height);
          const initialZoom = canvasSize / minDimension;
          setZoom(Math.max(initialZoom, 0.5));
          setPosition({ x: 0, y: 0 });
          setRotation(0);
          setFlip({ horizontal: false, vertical: false });
          setBrightness(100);
          setContrast(100);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      drawCanvas();
    }
  }, [imageSrc, zoom, position, rotation, flip, brightness, contrast]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!img) return;

    const canvasSize = 300;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear and fill background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.save();
    ctx.translate(canvasSize / 2, canvasSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      flip.horizontal ? -1 : 1,
      flip.vertical ? -1 : 1
    );

    const scale = zoom;
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;

    ctx.drawImage(
      img,
      -imgWidth / 2 + position.x,
      -imgHeight / 2 + position.y,
      imgWidth,
      imgHeight
    );

    ctx.restore();
    ctx.filter = 'none';

    // Draw circular mask overlay - show what will be cropped
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Draw circle border
    ctx.strokeStyle = '#0D3B33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 4, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const img = imageRef.current;
    if (!img) return;
    
    // Create a new canvas for the final output at higher resolution
    const outputCanvas = document.createElement('canvas');
    const outputSize = 400;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext('2d');

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    // Fill background
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 0, outputSize, outputSize);

    ctx.save();
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(
      flip.horizontal ? -1 : 1,
      flip.vertical ? -1 : 1
    );

    // Scale positions proportionally
    const scaleFactor = outputSize / 300;
    const scale = zoom * scaleFactor;
    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;

    ctx.drawImage(
      img,
      -imgWidth / 2 + position.x * scaleFactor,
      -imgHeight / 2 + position.y * scaleFactor,
      imgWidth,
      imgHeight
    );

    ctx.restore();
    ctx.filter = 'none';

    // Apply circular mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Convert to blob
    outputCanvas.toBlob((blob) => {
      onSave(blob);
      setIsSaving(false);
    }, 'image/jpeg', 0.92);
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
  };

  const resetAll = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setBrightness(100);
    setContrast(100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[500px] md:h-[550px]">
          {/* Left side - Canvas */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-6 md:p-8">
            <div className="relative">
              {/* Background grid pattern */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundImage: 'linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}
              />
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="cursor-move rounded-full relative z-10 shadow-lg"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              />
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="w-full md:w-80 bg-white flex flex-col border-t md:border-t-0 md:border-l border-gray-200">
            <DialogHeader className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-bold text-[#0D3B33]" style={{ fontFamily: 'Georgia, serif' }}>
                  Edit Profile Photo
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs defaultValue="crop" className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b border-gray-200 bg-gray-50 p-0 h-auto">
                <TabsTrigger 
                  value="crop" 
                  className="rounded-none py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#0D3B33] data-[state=active]:border-b-2 data-[state=active]:border-[#FE6C3A]"
                >
                  Position & Crop
                </TabsTrigger>
                <TabsTrigger 
                  value="adjust"
                  className="rounded-none py-3 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-[#0D3B33] data-[state=active]:border-b-2 data-[state=active]:border-[#FE6C3A]"
                >
                  Adjust
                </TabsTrigger>
              </TabsList>

              <TabsContent value="crop" className="flex-1 p-5 space-y-5 overflow-y-auto">
                {/* Zoom Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#0D3B33]">Zoom</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-gray-400" />
                    <Slider
                      value={[zoom]}
                      onValueChange={(values) => setZoom(values[0])}
                      min={0.3}
                      max={3}
                      step={0.05}
                      className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {/* Rotation Controls */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#0D3B33]">Transform</label>
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRotation((r) => r - 90)}
                      title="Rotate left"
                      className="h-10 border-gray-300"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRotation((r) => r + 90)}
                      title="Rotate right"
                      className="h-10 border-gray-300"
                    >
                      <RotateCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFlip((f) => ({ ...f, horizontal: !f.horizontal }))}
                      title="Flip horizontal"
                      className={`h-10 border-gray-300 ${flip.horizontal ? 'bg-gray-100' : ''}`}
                    >
                      <FlipHorizontal className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFlip((f) => ({ ...f, vertical: !f.vertical }))}
                      title="Flip vertical"
                      className={`h-10 border-gray-300 ${flip.vertical ? 'bg-gray-100' : ''}`}
                    >
                      <FlipVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-600 text-center">
                    💡 Drag the image to reposition it within the circle
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="adjust" className="flex-1 p-5 space-y-5 overflow-y-auto">
                {/* Brightness Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-gray-500" />
                      <label className="text-sm font-medium text-[#0D3B33]">Brightness</label>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {brightness}%
                    </span>
                  </div>
                  <Slider
                    value={[brightness]}
                    onValueChange={(values) => setBrightness(values[0])}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Contrast Control */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Contrast className="w-4 h-4 text-gray-500" />
                      <label className="text-sm font-medium text-[#0D3B33]">Contrast</label>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {contrast}%
                    </span>
                  </div>
                  <Slider
                    value={[contrast]}
                    onValueChange={(values) => setContrast(values[0])}
                    min={50}
                    max={150}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetAdjustments}
                  className="w-full border-gray-300 text-gray-600"
                >
                  Reset Adjustments
                </Button>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="p-5 border-t border-gray-200 space-y-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-[#FE6C3A] hover:bg-[#FF7B4A] text-white font-medium py-5"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  'Apply Changes'
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={resetAll}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                Reset All
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}