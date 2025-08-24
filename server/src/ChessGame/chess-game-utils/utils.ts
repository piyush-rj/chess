export function is_inside_board(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}

export function algebraic(x: number, y: number): string {
    return String.fromCharCode(97 + x) + (8 - y);
}
