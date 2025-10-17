import { UserModel, UserDocument } from '../models/userModel';

export class UserRepository { // Repository de sauvegarde pour les utilisateurs
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email }).exec();
  }
  async create(email: string, passwordHash: string, role: string = 'user'): Promise<UserDocument> {
    const user = await UserModel.create({ email, passwordHash, role });
    return user;
  }
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }
  async listAll(): Promise<UserDocument[]> {
    return UserModel.find({}).sort({ createdAt: -1 }).exec();
  }
  async updateById(id: string, data: Partial<Pick<UserDocument, 'email' | 'role' | 'passwordHash'>>): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
  async deleteById(id: string): Promise<UserDocument | null> {
    return UserModel.findByIdAndDelete(id).exec();
  }
}

export default new UserRepository();
