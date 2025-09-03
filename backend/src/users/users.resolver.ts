/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GraphQLJSON } from 'graphql-type-json';
import { CreateUserInput, UpdateUserInput } from 'src/common/dto/user.dto';

@ObjectType()
class MapState {
  @Field()
  lat: number;

  @Field()
  lng: number;

  @Field()
  zoom: number;

  @Field({ nullable: true })
  filters?: string;
}

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User | null> {
    return this.usersService.findById(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async saveMapState(
    @CurrentUser() user: User,
    @Args('mapPosition', { type: () => GraphQLJSON, nullable: true })
    mapPosition: { lat: number; lng: number } | null,
    @Args('mapZoom', { type: () => Number, nullable: true })
    mapZoom: number | null,
    @Args('mapFilters', { type: () => GraphQLJSON, nullable: true })
    mapFilters: Record<string, any> | null,
  ): Promise<boolean> {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await this.usersService.updateMapState(
      user.id,
      mapPosition,
      mapZoom,
      mapFilters,
    );
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { nullable: true })
  async getMapState(@CurrentUser() user: User): Promise<User | null> {
    return this.usersService.findById(user.id);
  }

  @ResolveField(() => GraphQLJSON, { nullable: true })
  mapPosition(@Parent() user: User): { lat: number; lng: number } | null {
    return user.mapPosition;
  }

  @Mutation(() => User)
  async createUser(@Args('input') input: CreateUserInput): Promise<User> {
    return this.usersService.create(input);
  }

  @Query(() => [User])
  async getAllUsers(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Mutation(() => User)
  async updateUser(
    @Args('id') id: string,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: string): Promise<boolean> {
    return this.usersService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  logout(@CurrentUser() user: User): boolean {
    // Placeholder: la déconnexion se fait côté frontend en supprimant le token
    return true;
  }
}
