import {fillRoundedRect} from "../Utils";

export enum ControlLineDirection {
    Vertical,
    Horizontal
}

export enum ControlLineMove {
    VerticalUp,
    VerticalDown,
    HorizontalLeft,
    HorizontalRight
}

export interface BoardData {
    bricks: number[][];
}

export interface Brick {
    type: number;
    style: string;
    value: number;
}

export interface GameBoardSetup {
    gameTitle: string;
    controlLines: ControlLine[];
    width: number;
    height: number;
}

export interface GameBoardDrawingParams {
    blockGapRatio: number;
    paddingGapRatio: number;
    controlLinePaddingRatio: number;
}

export interface ControlLine {
    direction: ControlLineDirection
    lineIndex: number
    start: number
    end: number
}

export interface mouseEventState {
    pressed: boolean;
    x: number;
    y: number;
}

interface DrawingUnit {
    sizeUnit: number;
    sizeBlock: number;
    sizePadding: number;
    getLenStart: (x: number) => number;
    getLenEnd: (x: number) => number;
}

export class GameBoardController {
    static isInit: boolean = false
    static instance: GameBoardController | undefined = undefined;
    static init(prop: GameBoardSetup, params: GameBoardDrawingParams): void {
        GameBoardController.isInit = true
        GameBoardController.instance = new GameBoardController(prop, params);
    }
    static getInstance(): GameBoardController {
        if (GameBoardController.instance === undefined) {
            throw new Error('Game Model not init')
        }
        return GameBoardController.instance;
    }

    bricks: (Brick | undefined)[];
    controlLines: ControlLine[];
    drawingParams: GameBoardDrawingParams;
    widthCrt: number;
    heightCrt: number;
    mouseState: mouseEventState;

    step: number = 0;
    stepMax: number = 2;

    gameEnd: boolean = false;
    score: number;

    private getBrick(x: number, y: number): Brick | undefined {
        return this.bricks[y * this.widthCrt + x];
    }

    private setBrick(x: number, y: number, val: Brick | undefined): void {
        this.bricks[y * this.widthCrt + x] = val;
    }

    private getDrawingUnit(context: CanvasRenderingContext2D): DrawingUnit {
        const areaSize = context.canvas.width;
        const sizeUnit     = areaSize  / (this.widthCrt * this.drawingParams.blockGapRatio  + (this.widthCrt + 1)   + 2 * this.drawingParams.paddingGapRatio);
        const sizeBlock    = sizeUnit * this.drawingParams.blockGapRatio;
        const sizePadding  = sizeUnit * this.drawingParams.paddingGapRatio;
        const getLenStart = (x: number) => (sizePadding + sizeUnit + x * (sizeBlock + sizeUnit));
        const getLenEnd   = (x: number) => (sizePadding + (x + 1) * (sizeBlock + sizeUnit));
        return {
            sizeUnit: sizeUnit,
            sizeBlock: sizeBlock,
            sizePadding: sizePadding,
            getLenStart: getLenStart,
            getLenEnd: getLenEnd
        }
    }

    constructor(prop: GameBoardSetup, params: GameBoardDrawingParams) {
        this.controlLines = prop.controlLines;
        this.widthCrt = prop.width;
        this.heightCrt = prop.height;
        this.bricks = Array<Brick | undefined>(this.heightCrt * this.widthCrt).fill(undefined);
        this.drawingParams = params;
        this.mouseState = {
            pressed: false,
            x: 0,
            y: 0
        }
        this.score = 0;
        this.generateNewBrick();
        this.generateNewBrick();
    }

    move(controlLineIndex: number, direction: ControlLineMove): boolean {
        const controlLine = this.controlLines[controlLineIndex];
        switch (direction) {
            case ControlLineMove.VerticalUp: {
                if (controlLine.direction !== ControlLineDirection.Vertical) return false;
                const areaBricks: Brick[] = [];
                let directlyPush = true;
                for(let i=controlLine.start;i<=controlLine.end;i++) {
                    const newBrick = this.getBrick(controlLine.lineIndex, i);
                    if(newBrick === undefined) continue;
                    if (directlyPush) {
                        areaBricks.push(newBrick);
                        directlyPush = false;
                        continue;
                    }
                    const lastBrick = areaBricks[areaBricks.length-1];
                    if(newBrick.value === lastBrick.value && newBrick.type === lastBrick.type) {
                        areaBricks[areaBricks.length-1].value *= 2;
                        this.score += areaBricks[areaBricks.length-1].value;
                        directlyPush = true;
                    }
                    else areaBricks.push(newBrick);
                }
                if (areaBricks.length === 0 || areaBricks.length === controlLine.end - controlLine.start + 1) return false;
                for(let i=controlLine.start;i<=controlLine.end;i++) {
                    const areaIndex = i - controlLine.start;
                    if(areaIndex < areaBricks.length) {
                        this.setBrick(controlLine.lineIndex, i, areaBricks[areaIndex]);
                    }
                    else{
                        this.setBrick(controlLine.lineIndex, i, undefined);
                    }
                }
                break;
            }
            case ControlLineMove.VerticalDown: {
                if (controlLine.direction !== ControlLineDirection.Vertical) return false;
                const areaBricks: Brick[] = [];
                let directlyPush = true;
                for(let i=controlLine.end;i>=controlLine.start;i--) {
                    const newBrick = this.getBrick(controlLine.lineIndex, i);
                    if(newBrick === undefined) continue;
                    if (directlyPush) {
                        areaBricks.push(newBrick);
                        directlyPush = false;
                        continue;
                    }
                    const lastBrick = areaBricks[areaBricks.length-1];
                    if(newBrick.value === lastBrick.value && newBrick.type === lastBrick.type) {
                        areaBricks[areaBricks.length-1].value *= 2;
                        this.score += areaBricks[areaBricks.length-1].value;
                        directlyPush = true;
                    }
                    else areaBricks.push(newBrick);
                }
                if (areaBricks.length === 0 || areaBricks.length === controlLine.end - controlLine.start + 1) return false;
                for(let i=controlLine.end;i>=controlLine.start;i--) {
                    const areaIndex = controlLine.end - i;
                    if(areaIndex < areaBricks.length) {
                        this.setBrick(controlLine.lineIndex, i, areaBricks[areaIndex]);
                    }
                    else{
                        this.setBrick(controlLine.lineIndex, i, undefined);
                    }
                }
                break;
            }
            case ControlLineMove.HorizontalLeft: {
                if (controlLine.direction !== ControlLineDirection.Horizontal) return false;
                const areaBricks: Brick[] = [];
                let directlyPush = true;
                for(let i=controlLine.start;i<=controlLine.end;i++) {
                    const newBrick = this.getBrick(i, controlLine.lineIndex);
                    if(newBrick === undefined) continue;
                    if (directlyPush) {
                        areaBricks.push(newBrick);
                        directlyPush = false;
                        continue;
                    }
                    const lastBrick = areaBricks[areaBricks.length-1];
                    if(newBrick.value === lastBrick.value && newBrick.type === lastBrick.type) {
                        areaBricks[areaBricks.length-1].value *= 2;
                        this.score += areaBricks[areaBricks.length-1].value;
                        directlyPush = true;
                    }
                    else areaBricks.push(newBrick);
                }
                if (areaBricks.length === 0 || areaBricks.length === controlLine.end - controlLine.start + 1) return false;
                for(let i=controlLine.start;i<=controlLine.end;i++) {
                    const areaIndex = i - controlLine.start;
                    if(areaIndex < areaBricks.length) {
                        this.setBrick(i, controlLine.lineIndex, areaBricks[areaIndex]);
                    }
                    else{
                        this.setBrick(i, controlLine.lineIndex, undefined);
                    }
                }
                break;
            }
            case ControlLineMove.HorizontalRight: {
                if (controlLine.direction !== ControlLineDirection.Horizontal) return false;
                const areaBricks: Brick[] = [];
                let directlyPush = true;
                for(let i=controlLine.end;i>=controlLine.start;i--) {
                    const newBrick = this.getBrick(i, controlLine.lineIndex);
                    if(newBrick === undefined) continue;
                    if (directlyPush) {
                        areaBricks.push(newBrick);
                        directlyPush = false;
                        continue;
                    }
                    const lastBrick = areaBricks[areaBricks.length-1];
                    if(newBrick.value === lastBrick.value && newBrick.type === lastBrick.type) {
                        areaBricks[areaBricks.length-1].value *= 2;
                        this.score += areaBricks[areaBricks.length-1].value;
                        directlyPush = true;
                    }
                    else areaBricks.push(newBrick);
                }
                if (areaBricks.length === 0 || areaBricks.length === controlLine.end - controlLine.start + 1) return false;
                for(let i=controlLine.end;i>=controlLine.start;i--) {
                    const areaIndex = controlLine.end - i;
                    if(areaIndex < areaBricks.length) {
                        this.setBrick(i, controlLine.lineIndex, areaBricks[areaIndex]);
                    }
                    else{
                        this.setBrick(i, controlLine.lineIndex, undefined);
                    }
                }
                break;
            }
        }
        return true;
    }

    private generateNewBrick() {
        const availableIndices: number[] = [];
        for(let index=0;index<this.widthCrt * this.heightCrt;index++) {
            if(this.bricks[index]===undefined) availableIndices.push(index);
        }
        const randomSelection: number = Math.floor(Math.random() * availableIndices.length);
        const randomIndex: number = availableIndices[randomSelection];
        if(Math.floor(Math.random() * 2) === 0) {
            this.bricks[randomIndex] = {
                type: 0,
                style: 'springgreen',
                value: 2
            }
        } else {
            this.bricks[randomIndex] = {
                type: 1,
                style: 'yellow',
                value: 2
            }
        }
    }

    private isEnd(): boolean {
        for(let y=0;y<this.heightCrt;y++) {
            for(let x=0;x<this.widthCrt-1;x++) {
                const brickA = this.getBrick(x, y);
                const brickB = this.getBrick(x+1, y);
                if(brickA === undefined || brickB === undefined) return false;
                if(brickA.type === brickB.type && brickA.value === brickB.value) return false;
            }
        }
        for(let x=0;x<this.widthCrt;x++) {
            for(let y=0;y<this.heightCrt-1;y++) {
                const brickA = this.getBrick(x, y);
                const brickB = this.getBrick(x, y+1);
                if(brickA === undefined || brickB === undefined) return false;
                if(brickA.type === brickB.type && brickA.value === brickB.value) return false;
            }
        }
        return true;
    }

    private drawBackground(context: CanvasRenderingContext2D) {
        const unit = this.getDrawingUnit(context);
        context.fillStyle = 'blanchedAlmond';
        fillRoundedRect(context, 0, 0, context.canvas.width, context.canvas.height, unit.sizeUnit);
        context.fillStyle = 'gainsboro';
        for(let y=0;y<this.heightCrt;y++) {
            for(let x=0;x<this.widthCrt;x++) {
                fillRoundedRect(context, unit.getLenStart(x), unit.getLenStart(y), unit.sizeBlock, unit.sizeBlock, unit.sizeUnit / 3);
            }
        }
    }

    private drawControlLines(context: CanvasRenderingContext2D) {
        const unit = this.getDrawingUnit(context);
        context.fillStyle = 'gray';
        this.controlLines.forEach((line) => {
            if(line.direction === ControlLineDirection.Vertical) {
                context.fillRect(unit.getLenStart(line.lineIndex) + unit.sizeUnit * this.drawingParams.controlLinePaddingRatio, unit.getLenStart(line.start), 1, unit.getLenEnd(line.end) - unit.getLenStart(line.start));
                context.fillRect(unit.getLenEnd(line.lineIndex) - unit.sizeUnit * this.drawingParams.controlLinePaddingRatio, unit.getLenStart(line.start), 1, unit.getLenEnd(line.end) - unit.getLenStart(line.start));
            }
            else {
                context.fillRect(unit.getLenStart(line.start), unit.getLenStart(line.lineIndex) + unit.sizeUnit * this.drawingParams.controlLinePaddingRatio, unit.getLenEnd(line.end) - unit.getLenStart(line.start), 1);
                context.fillRect(unit.getLenStart(line.start), unit.getLenEnd(line.lineIndex) - unit.sizeUnit * this.drawingParams.controlLinePaddingRatio, unit.getLenEnd(line.end) - unit.getLenStart(line.start), 1);
            }
        });
    }

    private drawBricks(context: CanvasRenderingContext2D) {
        const unit = this.getDrawingUnit(context);
        this.bricks.forEach((brick, index) => {
            if(brick === undefined) return;
            const x = index % this.widthCrt;
            const y = Math.floor(index / this.widthCrt);
            context.fillStyle = brick.style;
            fillRoundedRect(context, unit.getLenStart(x), unit.getLenStart(y), unit.sizeBlock, unit.sizeBlock, unit.sizeUnit / 3);
            context.fillStyle = 'black';
            context.font = "30px Arial";
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(String(brick.value), unit.getLenStart(x) + 0.5 * unit.sizeBlock, unit.getLenStart(y) + 0.5 * unit.sizeBlock);
        });
    }

    private drawEndGameScreen(context: CanvasRenderingContext2D) {
        const areaSize = context.canvas.width;
        context.fillStyle = 'blanchedAlmond';
        context.fillRect(0, areaSize / 3, context.canvas.width, areaSize / 3);
        context.font = "30px Arial";
        context.fillStyle = 'black';
        context.textAlign = 'center';
        context.fillText('Game End', areaSize / 2, areaSize / 2 - 10);
        context.font = "20px Arial";
        context.fillText('score ' + this.score, areaSize / 2, areaSize / 2 + 10);
    }

    drawMethod() {
        return (context: CanvasRenderingContext2D) => {
            this.drawBackground(context);
            this.drawBricks(context);
            this.drawControlLines(context);
            if(this.gameEnd) this.drawEndGameScreen(context);
        }
    }

    private handleMouseMovement(x1: number, y1: number, x2: number, y2: number, sizeUnit: number): boolean {
        if (Math.abs(x1 - x2) < sizeUnit && Math.abs(y1 - y2) < sizeUnit) return false;
        const moveDir: ControlLineDirection = Math.abs(x1 - x2) > Math.abs(y1 - y2)? ControlLineDirection.Horizontal : ControlLineDirection.Vertical;
        let moveDirection: ControlLineMove;
        if(moveDir === ControlLineDirection.Horizontal) {
            if(x2 > x1) moveDirection = ControlLineMove.HorizontalRight;
            else moveDirection = ControlLineMove.HorizontalLeft;
        } else {
            if(y2 > y1) moveDirection = ControlLineMove.VerticalDown;
            else moveDirection = ControlLineMove.VerticalUp;
        }
        let lineIndex = -1;
        const xCrt = Math.floor((x1 - sizeUnit * (this.drawingParams.controlLinePaddingRatio + 0.5 * this.drawingParams.paddingGapRatio)) / (sizeUnit * (1+this.drawingParams.blockGapRatio)))
        const yCrt = Math.floor((y1 - sizeUnit * (this.drawingParams.controlLinePaddingRatio + 0.5 * this.drawingParams.paddingGapRatio)) / (sizeUnit * (1+this.drawingParams.blockGapRatio)))
        this.controlLines.forEach((line, index) => {
            if(lineIndex !== -1) return;
            if(moveDir === ControlLineDirection.Vertical && line.direction === ControlLineDirection.Vertical) {
                if(xCrt === line.lineIndex && yCrt >= line.start && yCrt <= line.end) lineIndex = index;
            }
            if(moveDir === ControlLineDirection.Horizontal && line.direction === ControlLineDirection.Horizontal) {
                if(yCrt === line.lineIndex && xCrt >= line.start && xCrt <= line.end) lineIndex = index;
            }
        });
        if(lineIndex === -1) return false;
        const moveResult = this.move(lineIndex, moveDirection);
        if (!moveResult) return false;
        this.step += 1;
        if(this.step === this.stepMax) {
            this.generateNewBrick();
            this.step = 0;
        }
        if(this.isEnd()) {
            this.gameEnd = true;
        }
        return true;
    }

    mouseEventMethod(canvas: HTMLCanvasElement, event: MouseEvent): {refresh: boolean, score: number} {
        const areaSize = canvas.width;
        const sizeUnit  = areaSize  / (this.widthCrt * this.drawingParams.blockGapRatio  + (this.widthCrt + 1)   + 2 * this.drawingParams.paddingGapRatio);
        const rect = canvas.getBoundingClientRect();
        const x = event.x - rect.x;
        const y = event.y - rect.y;
        let refresh = false;
        if (event.type === 'mousedown') {
            this.mouseState.pressed = true;
            this.mouseState.x = x;
            this.mouseState.y = y;
        }
        else if (event.type === 'mouseup') {
            refresh = this.handleMouseMovement(this.mouseState.x, this.mouseState.y, x, y, sizeUnit);
        }
        const score = this.score;
        return {refresh, score};
    }

    touchEventMethod(canvas: HTMLCanvasElement, event: TouchEvent): {refresh: boolean, score: number} {
        const areaSize = canvas.width;
        const sizeUnit  = areaSize  / (this.widthCrt * this.drawingParams.blockGapRatio  + (this.widthCrt + 1)   + 2 * this.drawingParams.paddingGapRatio);
        const rect = canvas.getBoundingClientRect();
        const x = event.changedTouches[0].clientX - rect.x;
        const y = event.changedTouches[0].clientY - rect.y;
        let refresh = false;
        if (event.type === 'touchstart') {
            this.mouseState.pressed = true;
            this.mouseState.x = x;
            this.mouseState.y = y;
        }
        else if (event.type === 'touchend') {
            refresh = this.handleMouseMovement(this.mouseState.x, this.mouseState.y, x, y, sizeUnit);
        }
        const score = this.score;
        return {refresh, score};
    }

}
