import { classToPlain, Expose, plainToClass } from 'class-transformer';

export interface IPackage {
  npmSlug: string;
  // TODO, make the github integration
  github?: any;
}

export interface IPackages {
  [key: string]: IPackage;
}

export class User {
  public readonly chatId: number;

  get packages(): IPackages {
    return JSON.parse(JSON.stringify(this._packages));
  }
  set packages(packages: IPackages) {
    this._packages = JSON.parse(JSON.stringify(packages));
  }
  @Expose({ name: 'packages' })
  private _packages: IPackages;

  static toClass(raw: any): User {
    return plainToClass(User, raw);
  }

  /**
   * Iterate the packages that has the user
   * @returns IPackage[]
   */
  get packagesIterative(): IPackage[] {
    return Object.values(this._packages);
  }

  /**
   * Get how many packages has the user
   */
  get nPackages(): number {
    return this.packagesIterative.length;
  }

  constructor(chatId: number) {
    this.chatId = chatId;
    this._packages = {};
  }

  /**
   * Add the package to the list
   *
   * @param pack The package to add
   */
  addPackage(pack: IPackage) {
    this._packages[pack.npmSlug] = { ...pack };
  }

  /**
   * Remove a package given the npm slug
   *
   * @param npmSlug The npm package slug to remove
   */
  removePackage(npmSlug: IPackage['npmSlug']) {
    delete this._packages[npmSlug];
  }

  /**
   * Given an slug, check if it is already in the list
   *
   * @param slug
   * @returns true is means that the package is already in the list
   */
  hasPackage(slug: string): boolean {
    return !!this._packages[slug];
  }

  /**
   * Transform the instance to a plain javascript object
   */
  toJson() {
    return classToPlain(this);
  }
}
