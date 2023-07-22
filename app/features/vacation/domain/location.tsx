import { Entity } from "~/shared/domain/entity";

interface LocationProps {
  name: string;
  description: string;
}

export class LocationEntity extends Entity<LocationProps> {
  private constructor(props: LocationProps, id?: string) {
    super(props, id);
  }

  static create(props: LocationProps, id?: string) {
    return new LocationEntity(props, id);
  }
}
