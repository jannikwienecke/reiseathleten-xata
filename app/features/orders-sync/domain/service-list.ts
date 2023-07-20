import { ValueObject } from "~/shared";
import { ServiceValueObject } from "./service";

export class ServiceList extends ValueObject<ServiceValueObject[]> {
  private constructor(props: ServiceValueObject[]) {
    super(props);
  }

  static create(props: ServiceValueObject[]) {
    return new ServiceList(props);
  }

  static createServicesFromString(servicesString: string): ServiceList {
    const services = servicesString
      .split(", ")
      .map((s) => s.trim())
      .map((s) => ServiceValueObject.create({ name: s, description: "" }));

    return this.create(services);
  }

  get list() {
    return Object.values(this.props);
  }
}