import zod from "zod";
import { ValueObject } from "~/shared";

const moodSchema = zod.enum(["excited", "loved", "happy", "sad", "thumbsy"]);
type MoodType = zod.infer<typeof moodSchema>;

export interface MoodProps {
  value?: MoodType | null;
}

export class Mood extends ValueObject<MoodProps> {
  private constructor(props: MoodProps) {
    super(props);
  }

  static create(props: MoodProps) {
    if (!props.value) {
      return new Mood({ value: null });
    } else {
      moodSchema.parse(props.value);

      return new Mood({ value: props.value });
    }
  }

  get mood() {
    return this.props.value;
  }
}
