import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserInput, UpdateUserInput } from '../common/dto/user.dto';

// This service handles operations related to user management.
// It includes methods for CRUD operations and managing user-specific data such as map state.

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // The `findById` method retrieves a user by their unique ID.
  // It is used to fetch user details, including their saved map state.
  async findById(userId: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await this.userRepository.update(id, input);
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  // The `updateMapState` method updates the user's last map view state.
  // This includes the map's position, zoom level, and any applied filters.
  async updateMapState(
    userId: string,
    mapPosition: { lat: number; lng: number } | null,
    mapZoom: number | null,
    mapFilters: Record<string, any> | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      mapPosition,
      mapZoom,
      mapFilters,
    });
  }
}
