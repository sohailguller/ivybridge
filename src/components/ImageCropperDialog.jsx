import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, X } from "lucide-react";

export default function ImageCropperDialog({ open, onOpenChange, imageFile, onSave }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setImageSrc(e.target.result);
          // Center the image initially
          setPosition({ x: 0, y: 0 });
          setZoom(1);
          setRotation(0);
          setFlip({ horizontal: false, vertical: false });
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
  }, [imageSrc, zoom, position, rotation, flip]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    if (!img) return;

    const canvasSize = 400;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

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

    // Draw circular mask overlay
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    // Draw white circle border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvasSize / 2, canvasSize / 2, canvasSize / 2 - 2, 0, Math.PI * 2);
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
    const canvas = canvasRef.current;
    
    // Create a new canvas for the final output
    const outputCanvas = document.createElement('canvas');
    const outputSize = 400;
    outputCanvas.width = outputSize;
    outputCanvas.height = outputSize;
    const ctx = outputCanvas.getContext('2d');

    // Draw the cropped image
    ctx.drawImage(canvas, 0, 0, outputSize, outputSize);

    // Convert to blob
    outputCanvas.toBlob((blob) => {
      onSave(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        <div className="flex h-[600px]">
          {/* Left side - Canvas */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="cursor-move rounded-full"
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
          <div className="w-80 bg-white flex flex-col">
            <DialogHeader className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-lg font-semibold">Edit image</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <Tabs defaultValue="crop" className="flex-1 flex flex-col">
              <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
                <TabsTrigger value="crop">Crop</TabsTrigger>
                <TabsTrigger value="filter" disabled className="opacity-50">Filter</TabsTrigger>
                <TabsTrigger value="adjust" disabled className="opacity-50">Adjust</TabsTrigger>
              </TabsList>

              <TabsContent value="crop" className="flex-1 p-6 space-y-6">
                {/* Rotation Controls */}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((r) => r - 90)}
                    title="Rotate left"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setRotation((r) => r + 90)}
                    title="Rotate right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFlip((f) => ({ ...f, horizontal: !f.horizontal }))}
                    title="Flip horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFlip((f) => ({ ...f, vertical: !f.vertical }))}
                    title="Flip vertical"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </Button>
                </div>

                {/* Zoom Control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Zoom</label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(values) => setZoom(values[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 text-center">
                    {Math.round(zoom * 100)}%
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Drag the image to reposition
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="p-6 border-t">
              <Button
                onClick={handleSave}
                className="w-full bg-[#0A66C2] hover:bg-[#004182] text-white"
              >
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}