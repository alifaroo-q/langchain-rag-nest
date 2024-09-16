import * as path from 'path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { v4 as uuid } from 'uuid';

export const MulterFileUpload = (options: {
  uploadLocation: string;
  allowedFile: string[];
  fileSize: number;
}): MulterOptions => {
  return {
    limits: { fileSize: options.fileSize * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
      const ext = path.parse(file.originalname).ext;
      if (!options.allowedFile.includes(ext)) {
        req.fileValidationError = 'Invalid File Type';
        return callback(
          new BadRequestException('Invalid File Type: ' + ext),
          false,
        );
      }
      return callback(null, true);
    },
    storage: diskStorage({
      destination: options.uploadLocation,
      filename: (req: any, file, cb) => {
        const fn = path.parse(file.originalname);
        const filename = `${fn.name}_${uuid()}${fn.ext}`;
        cb(null, filename);
      },
    }),
  };
};
