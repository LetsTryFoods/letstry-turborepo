import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthorDocument, AUTHOR_MODEL } from './author.schema';
import { Author } from './author.graphql';
import { CreateAuthorInput, UpdateAuthorInput } from './author.input';

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(AUTHOR_MODEL) private authorModel: Model<AuthorDocument>,
  ) {}

  async create(input: CreateAuthorInput): Promise<Author> {
    const created = new this.authorModel(input);
    const saved = await created.save();
    return saved.toObject() as any as Author;
  }

  async findAll(): Promise<Author[]> {
    return (await this.authorModel.find().sort({ position: 1 }).lean().exec()) as any as Author[];
  }

  async findActive(): Promise<Author[]> {
    return (await this.authorModel
      .find({ isActive: true })
      .sort({ position: 1 })
      .lean()
      .exec()) as any as Author[];
  }

  async findTeam(): Promise<Author[]> {
    return (await this.authorModel
      .find({ isActive: true, isTeamMember: true })
      .sort({ position: 1 })
      .lean()
      .exec()) as any as Author[];
  }

  async findBySlug(slug: string): Promise<Author> {
    const author = await this.authorModel.findOne({ slug }).lean().exec();
    if (!author) throw new NotFoundException(`Author ${slug} not found`);
    return author as any as Author;
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorModel.findById(id).lean().exec();
    if (!author) throw new NotFoundException(`Author ${id} not found`);
    return author as any as Author;
  }

  async update(id: string, input: UpdateAuthorInput): Promise<Author> {
    const author = await this.authorModel
      .findByIdAndUpdate(id, input, { new: true })
      .lean()
      .exec();
    if (!author) throw new NotFoundException(`Author ${id} not found`);
    return author as any as Author;
  }

  async remove(id: string): Promise<Author> {
    const author = await this.authorModel.findByIdAndDelete(id).lean().exec();
    if (!author) throw new NotFoundException(`Author ${id} not found`);
    return author as any as Author;
  }
}
