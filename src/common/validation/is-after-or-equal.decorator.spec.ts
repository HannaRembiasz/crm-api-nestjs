import { validate } from 'class-validator';
import { IsAfterOrEqual } from './is-after-or-equal.decorator.js';

class TestDto {
  from?: string;

  @IsAfterOrEqual('from')
  to?: string;
}

describe('IsAfterOrEqual', () => {
  it('should pass when to is after from', async () => {
    const dto = new TestDto();

    dto.from = '2026-09-01';
    dto.to = '2026-09-10';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should pass when to equals from', async () => {
    const dto = new TestDto();

    dto.from = '2026-09-10';
    dto.to = '2026-09-10';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when to is before from', async () => {
    const dto = new TestDto();

    dto.from = '2026-09-10';
    dto.to = '2026-09-01';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('to');
    expect(errors[0].constraints).toHaveProperty('isAfterOrEqual');
  });

  it('should pass when either value is missing', async () => {
    const dtoWithoutFrom = new TestDto();
    dtoWithoutFrom.to = '2026-09-10';

    const errorsWithoutFrom = await validate(dtoWithoutFrom);

    expect(errorsWithoutFrom).toHaveLength(0);

    const dtoWithoutTo = new TestDto();
    dtoWithoutTo.from = '2026-09-01';

    const errorsWithoutTo = await validate(dtoWithoutTo);

    expect(errorsWithoutTo).toHaveLength(0);
  });
});