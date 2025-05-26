import { supabase } from '../lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export interface PasswordUpdateResponse {
  success: boolean;
  error?: string;
}

export interface OTPResponse {
  success: boolean;
  error?: string;
}

class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error.message);
        return {
          success: false,
          error: this.getErrorMessage(error),
        };
      }

      if (data.user && data.session) {
        console.log('Sign in successful:', data.user.email);
        return {
          success: true,
          user: data.user,
          session: data.session,
        };
      }

      return {
        success: false,
        error: 'Giriş işlemi başarısız oldu',
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error.message);
        return {
          success: false,
          error: this.getErrorMessage(error),
        };
      }

      console.log('Sign out successful');
      return {
        success: true,
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Çıkış işlemi başarısız oldu',
      };
    }
  }

  /**
   * Reset password - sends OTP to email
   */
  async resetPassword(email: string): Promise<OTPResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: 'diabetesisp://reset-password',
      });

      if (error) {
        console.error('Reset password error:', error.message);
        return {
          success: false,
          error: this.getErrorMessage(error),
        };
      }

      console.log('Password reset email sent');
      return {
        success: true,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Şifre sıfırlama işlemi başarısız oldu',
      };
    }
  }

  /**
   * Update password with new password
   */
  async updatePassword(newPassword: string): Promise<PasswordUpdateResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Update password error:', error.message);
        return {
          success: false,
          error: this.getErrorMessage(error),
        };
      }

      console.log('Password updated successfully');
      return {
        success: true,
      };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: 'Şifre güncelleme işlemi başarısız oldu',
      };
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Convert Supabase error to user-friendly message
   */
  private getErrorMessage(error: AuthError): string {
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email veya şifre hatalı';
      case 'Email not confirmed':
        return 'Email adresiniz onaylanmamış';
      case 'Too many requests':
        return 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
      case 'Signup not allowed for this instance':
        return 'Kayıt işlemi şu anda kapalı';
      case 'Password should be at least 6 characters':
        return 'Şifre en az 6 karakter olmalıdır';
      case 'User not found':
        return 'Kullanıcı bulunamadı';
      default:
        return error.message || 'Bir hata oluştu';
    }
  }
}

export const authService = new AuthService(); 