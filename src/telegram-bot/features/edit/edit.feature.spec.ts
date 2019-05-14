import { Test, TestingModule } from '@nestjs/testing';
import { EditFeature } from './edit.feature';

describe('EditFeature', () => {
  let service: EditFeature;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditFeature],
    }).compile();

    service = module.get<EditFeature>(EditFeature);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
