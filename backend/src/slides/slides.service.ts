// backend/src/slides/slides.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateSlideDto } from './dto/create-slide.dto';
import { UpdateSlideDto } from './dto/update-slide.dto';

@Injectable()
export class SlidesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // Tạo một Slide mới
  async create(createSlideDto: CreateSlideDto) {
    const { title, link, isActive, displayOrder, file } = createSlideDto;

    // Kiểm tra file ảnh
    if (!file) {
      throw new BadRequestException('File ảnh là bắt buộc');
    }

    try {
      // Upload ảnh lên Cloudinary
      const uploadResult = await this.cloudinaryService.uploadFile(file);

      // Lưu thông tin file vào bảng File
      const fileRecord = await this.prisma.file.create({
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          file_type: 'image',
          size: uploadResult.bytes,
          uploaded_at: new Date(),
        },
      });

      // Tạo Slide với imageId liên kết đến file vừa upload
      const slide = await this.prisma.slide.create({
        data: {
          title,
          imageId: fileRecord.id,
          link,
          isActive: isActive !== undefined ? isActive : true,
          displayOrder: displayOrder || 0,
        },
        include: {
          image: true,
        },
      });

      return {
        message: 'Tạo slide thành công',
        data: slide,
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi tạo slide: ' + error.message);
    }
  }

  // Lấy danh sách tất cả Slide
  async findAll() {
    const slides = await this.prisma.slide.findMany({
      include: { image: true },
      orderBy: { displayOrder: 'asc' },
    });

    return {
      message: 'Lấy danh sách slide thành công',
      data: slides,
    };
  }

  // Lấy thông tin chi tiết của một Slide theo ID
  async findOne(id: string) {
    const slide = await this.prisma.slide.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!slide) {
      throw new NotFoundException('Slide không tồn tại');
    }

    return {
      message: 'Lấy thông tin slide thành công',
      data: slide,
    };
  }

  // Cập nhật thông tin của một Slide
  async update(id: string, updateSlideDto: UpdateSlideDto) {
    const slide = await this.prisma.slide.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!slide) {
      throw new NotFoundException('Slide không tồn tại');
    }

    const { title, link, isActive, displayOrder, file } = updateSlideDto;

    // Kiểm tra nếu không có thay đổi
    const hasChanges =
      title !== undefined ||
      link !== undefined ||
      isActive !== undefined ||
      displayOrder !== undefined ||
      file !== undefined;

    if (!hasChanges) {
      return {
        message: 'Không có thay đổi để cập nhật',
        data: slide,
      };
    }

    try {
      let newImageId = slide.imageId;
      let oldImagePublicId = slide.image.public_id;
      let oldImageId = slide.imageId;

      // Nếu có file mới, upload file và cập nhật imageId
      if (file) {
        // Upload ảnh mới lên Cloudinary
        const uploadResult = await this.cloudinaryService.uploadFile(file);

        // Lưu thông tin file mới vào bảng File
        const newFileRecord = await this.prisma.file.create({
          data: {
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            file_type: 'image',
            size: uploadResult.bytes,
            uploaded_at: new Date(),
          },
        });

        newImageId = newFileRecord.id;
      }

      // Cập nhật Slide với imageId mới (nếu có)
      const updatedSlide = await this.prisma.slide.update({
        where: { id },
        data: {
          title,
          imageId: newImageId, // Cập nhật imageId trước
          link,
          isActive,
          displayOrder,
        },
        include: {
          image: true,
        },
      });

      // Sau khi cập nhật imageId, xóa ảnh cũ trên Cloudinary và trong bảng File (nếu có file mới)
      if (file) {
        await this.cloudinaryService.deleteFile(oldImagePublicId);
        await this.prisma.file.delete({
          where: { id: oldImageId },
        });
      }

      return {
        message: 'Cập nhật slide thành công',
        data: updatedSlide,
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi cập nhật slide: ' + error.message);
    }
  }

  // Xóa một Slide
  async remove(id: string) {
    const slide = await this.prisma.slide.findUnique({
      where: { id },
      include: { image: true },
    });

    if (!slide) {
      throw new NotFoundException('Slide không tồn tại');
    }

    try {
      // Xóa ảnh trên Cloudinary
      await this.cloudinaryService.deleteFile(slide.image.public_id);

      // Xóa bản ghi trong bảng File
      await this.prisma.file.delete({
        where: { id: slide.imageId },
      });

      // Xóa Slide
      await this.prisma.slide.delete({
        where: { id },
      });

      return {
        message: 'Xóa slide thành công',
      };
    } catch (error) {
      throw new BadRequestException('Lỗi khi xóa slide: ' + error.message);
    }
  }
}
