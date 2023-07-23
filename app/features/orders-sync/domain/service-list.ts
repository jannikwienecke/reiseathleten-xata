import { ValueObject } from "~/shared";
import { ServiceValueObject } from "./service";

export class ServiceList extends ValueObject<ServiceValueObject[]> {
  services: ServiceValueObject[];
  newServicecs: ServiceValueObject[];

  private constructor(props: ServiceValueObject[]) {
    super(props);
    this.services = props;
    this.newServicecs = [];
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
    return [...this.services].map((service) => service);
  }

  addService(event: ServiceValueObject) {
    this.services.push(event);
    this.newServicecs.push(event);
  }

  removeService(serviceId: number) {
    this.services = this.services.filter((_, index) => index !== serviceId);

    if (serviceId < this.newServicecs.length) {
      this.newServicecs = this.newServicecs.filter(
        (_, index) => index !== serviceId
      );
    }
  }
}
