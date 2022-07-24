import React, {useEffect, useRef} from "react";
import {ControlLineDirection, GameBoardController} from "./GameBoardController";

export function GameBoard() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    useEffect(() => {
        if(!GameBoardController.isInit) {
            GameBoardController.init(
                {
                    gameTitle: 'test Level',
                    controlLines: [
                        {
                            direction: ControlLineDirection.Vertical,
                            lineIndex: 0,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Vertical,
                            lineIndex: 1,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Vertical,
                            lineIndex: 2,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Vertical,
                            lineIndex: 3,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Horizontal,
                            lineIndex: 0,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Horizontal,
                            lineIndex: 1,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Horizontal,
                            lineIndex: 2,
                            start: 0,
                            end: 3
                        },
                        {
                            direction: ControlLineDirection.Horizontal,
                            lineIndex: 3,
                            start: 0,
                            end: 3
                        }
                    ],
                    width: 4,
                    height: 4
                }, {
                    blockGapRatio: 5,
                    paddingGapRatio: 1,
                    controlLinePaddingRatio: 1.5
                });
        }
        const innerController = GameBoardController.getInstance();
        if(!innerController) return;
        const resize = () => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d');
            if(canvas && context) {
                let length = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
                if (length > 600) length = 600;
                canvas.style.width = String(length) + 'px';
                canvas.style.height = String(length) + 'px';
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
                innerController.drawMethod()(context);
            }
        };
        resize();
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousedown', (event): void => {
            innerController.mouseEventMethod(canvas, event);
        });
        canvas?.addEventListener('touchstart', (event): void => {
            innerController.touchEventMethod(canvas, event);
        });
        canvas?.addEventListener('mouseup', (event): void => {
            const rerender = innerController.mouseEventMethod(canvas, event);
            if(rerender) resize();
        });
        canvas?.addEventListener('touchend', (event): void => {
            const rerender = innerController.touchEventMethod(canvas, event);
            if(rerender) resize();
        });
        window.addEventListener('touchmove', (event): void => {
            event.preventDefault();
        }, {passive: false});

    }, []);

    return (
        <div>
            <h2>Game</h2>
            <canvas ref={canvasRef}/>
        </div>
    );
}