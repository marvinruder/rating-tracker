declare module "hare-niemeyer" {
  export default function (
    votes: { [key: string]: number },
    seats: number,
    options?: { draw?: boolean },
  ): { [key: string]: number };
}
