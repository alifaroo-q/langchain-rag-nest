import {
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterFileUpload } from 'src/utils/app/file-upload.multer';
import { UPLOAD_LOCATION } from 'src/constant/common.constant';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/upload-file')
  @UseInterceptors(
    FileInterceptor(
      'file',
      MulterFileUpload({
        uploadLocation: UPLOAD_LOCATION,
        allowedFile: ['.pdf'],
        fileSize: 10,
      }),
    ),
  )
  async uploadFileAndCreateEmbeddings(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.chatService.uploadFileAndCreateEmbeddings(file);
  }
}
