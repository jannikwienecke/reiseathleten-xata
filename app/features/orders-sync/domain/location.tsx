import { Entity } from "~/shared/domain/entity";

interface LocationProps {
  name: string;
  description: string;
}

export class LocationEntity extends Entity<LocationProps> {
  private constructor(props: LocationProps, id?: number) {
    super(props, id);
  }

  static create(props: LocationProps, id?: number) {
    if (!props.name) {
      throw new Error("Location name is required");
    }

    return new LocationEntity(props, id);
  }

  get id() {
    return this._id;
  }
}
