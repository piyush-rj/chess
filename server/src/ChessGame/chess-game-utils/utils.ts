
// inside board or not
export function is_inside_board(x: number, y: number): boolean {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
}