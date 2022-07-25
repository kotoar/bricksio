import React, {useEffect, useRef, useState} from "react";
import {ControlLineDirection, GameBoardController} from "./GameBoardController";
import '../styles/components.css'
import '../styles/homepage.css'

export function GameBoard() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [pageWidth, setPageWidth] = useState<number>(600);
    const [score, setScore] = useState<number>(0);

    const resize = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const innerController = GameBoardController.getInstance();
        if(!innerController) return;
        if(canvas && context) {
            let length = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
            if (length > 600) length = 600;
            setPageWidth(length);
            length -= 40;
            canvas.style.width = String(length) + 'px';
            canvas.style.height = String(length) + 'px';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            innerController.drawMethod()(context);
        }
    };

    useEffect(() => {
        document.body.classList.add('document-background-color');
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
                    controlLinePaddingRatio: 0.5
                });
        }
        const innerController = GameBoardController.getInstance();
        if(!innerController) return;
        resize();
        const canvas = canvasRef.current;
        canvas?.addEventListener('mousedown', (event): void => {
            innerController.mouseEventMethod(canvas, event);
        });
        canvas?.addEventListener('touchstart', (event): void => {
            innerController.touchEventMethod(canvas, event);
        });
        canvas?.addEventListener('mouseup', (event): void => {
            const {refresh, score} = innerController.mouseEventMethod(canvas, event);
            if(refresh) resize();
            setScore(score);
        });
        canvas?.addEventListener('touchend', (event): void => {
            const {refresh, score} = innerController.touchEventMethod(canvas, event);
            if(refresh) resize();
            setScore(score);
        });
        canvas?.addEventListener('touchmove', (event): void => {
            event.preventDefault();
        }, {passive: false});

    }, []);

    return (
        <div style={{width: pageWidth}} className={'web-container'}>
            <div className={'main-container'}>
                <div className={'title-line'}>
                    <h1 className={'main-title'}>Rubik's Bricks</h1>
                    <span className={'score-text'}>score: {score}</span>
                </div>
                <canvas ref={canvasRef} style={{marginTop: 50, marginBottom: 50}}/>
                <div className={'how-to-play-block'}>
                    <p>
                        <strong>How to play:</strong>
                        <br/>
                        Drag each <strong>Control Line</strong> to move and merge bricks.
                        Bricks with same number and type will merge into one.
                        <br/>
                        Get higher score by merging more bricks!
                    </p>
                </div>
                <div>
                    made by @<u>kotoar</u>
                </div>
            </div>
        </div>
    );
}