import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        getAuth(),
        email,
        password,
      );
      const user = userCredential.user;

      const payload = { email: user.email, uid: user.uid };

      return {
        access_token: this.jwtService.sign(payload, {secret:process.env.NEXT_PUBLIC_JWT_SECRET}),
        uid: user.uid,
        email: user.email,
      };
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async createUser(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
      const user = userCredential.user;
      return { uid: user.uid, email: user.email };
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error('Error creating user: ' + error.message);
      }
      throw error;
    }
  }

  // Function to reset a password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(getAuth(), email);
      return { message: 'Password reset email sent' };
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error('Error sending password reset email: ' + error.message);
      }
      throw error;
    }
  }
}
