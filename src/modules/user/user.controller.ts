import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CursorPaginationOptionsDto } from 'src/common/dto/cursor-pagination-options.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    // await this.userService.isExist({ email: createUserDto.email });
    return await this.userService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get('/cursor-paginate')
  async cursorPaginate(@Query() cursorPaginationOptionsDto: CursorPaginationOptionsDto) {
    return await this.userService.cursorPaginate(cursorPaginationOptionsDto);
  }

  @Get(':userId')
  async findOne(@Param('userId', new ParseUUIDPipe()) userId: string) {
    return await this.userService.findOne({ uuid: userId });
  }

  @Put(':userId')
  async updateOne(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.update({ uuid: userId }, updateUserDto);
    return await this.userService.findOne({ uuid: userId });
  }

  @Delete(':userId')
  async deleteOne(@Param('userId', new ParseUUIDPipe()) userId: string) {
    await this.userService.delete({ uuid: userId });
    return 'User deleted.';
  }

  @Delete()
  async deleteAll() {
    await this.userService.deleteAll();
    return 'All user deleted.';
  }
}
