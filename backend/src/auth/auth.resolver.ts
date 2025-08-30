import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginUserInput, RegisterUserInput } from '../common/dto/user.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class AuthPayload {
  @Field()
  access_token: string;

  @Field(() => User)
  user: User;
}

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async register(
    @Args('input') input: RegisterUserInput,
  ): Promise<AuthPayload> {
    const result = await this.authService.register(
      input.email,
      input.password,
      input.firstName,
      input.lastName,
    );
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Mutation(() => AuthPayload)
  async login(
    @Args('input') loginUserInput: LoginUserInput,
  ): Promise<AuthPayload> {
    const result = await this.authService.login(
      loginUserInput.email,
      loginUserInput.password,
    );
    return {
      access_token: result.access_token,
      user: result.user,
    };
  }
}
