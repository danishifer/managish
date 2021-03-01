export default class HERE {

  static mapLocationData = (ld: any) => {
    let location: any = {};
    if (ld.address.district) location.city = ld.address.district;
    if (ld.address.street) location.street = ld.address.street;
    if (ld.address.district) location.city = ld.address.district;
    location.country = ld.address.country;
    location.postalCode = ld.address.postalCode;
    location.coordinates = {
      lat: ld.position[0],
      long: ld.position[1],
    }
    return location;
  }
}