import { Mapper, createMap } from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { CreateReceiptDto } from '../../dtos/requests/create-receipt.dto';
import { ReceiptDto } from '../../dtos/requests/receipt.dto';

@Injectable()
export class ReceiptProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // model to dto
      createMap(mapper, CreateReceiptDto, ReceiptDto);
      createMap(mapper, ReceiptDto, CreateReceiptDto);
    };
  }
}
