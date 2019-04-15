import { classToPlain } from 'class-transformer';

export interface IPackage {
  npmSlug: string;
  // TODO, make the github integration
  github?: any;
}

interface IPackages {
  [key: string]: IPackage;
}

export class User {
  public readonly chatId: number;

  packages: IPackages;

  get packagesIterative(): IPackage[] {
    return Object.keys(this.packages)
      .map((key) => this.packages[key]);
  }

  constructor(chatId: number) {
    this.chatId = chatId;
    this.packages = {};
  }

  /**
   * Add the package to the list
   *
   * @param pack The package to add
   */
  addPackage(pack: IPackage) {
    this.packages[pack.npmSlug] = pack;
  }

  /**
   * Given an slug, check if it is already in the list
   *
   * @param slug
   * @returns true is means that the package is already in the list
   */
  hasPackage(slug: string): boolean {
    return !!this.packages[slug];
  }

  /**
   * Transform the instance to a plain javascript object
   */
  toJson(): any {
    return classToPlain(this) as any;
  }
}
