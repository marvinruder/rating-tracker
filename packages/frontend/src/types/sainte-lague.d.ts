declare module "sainte-lague" {
  export default function (
    votes: { [key: string]: number },
    seats: number,
    options?: { draw?: boolean },
  ): { [key: string]: number };
}
