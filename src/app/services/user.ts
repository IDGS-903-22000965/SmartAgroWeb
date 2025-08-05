import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  PaginatedUsersDto, 
  UserListDto, 
  CreateUserDto, 
  UpdateUserDto, 
  ResetPasswordDto, 
  UserStatsDto,
  ApiResponse 
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    console.log('UserService initialized with URL:', this.API_URL);
  }

  getUsers(
    pageNumber: number = 1, 
    pageSize: number = 10, 
    searchTerm?: string, 
    roleFilter?: string, 
    isActive?: boolean
  ): Observable<PaginatedUsersDto> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (roleFilter) {
      params = params.set('roleFilter', roleFilter);
    }
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<PaginatedUsersDto>(this.API_URL, { params });
  }

  getUserById(id: string): Observable<UserListDto> {
    return this.http.get<UserListDto>(`${this.API_URL}/${id}`);
  }

  createUser(user: CreateUserDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API_URL, user);
  }

  updateUser(id: string, user: UpdateUserDto): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/${id}`, user);
  }

  deleteUser(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API_URL}/${id}`);
  }

  toggleUserStatus(id: string): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.API_URL}/${id}/toggle-status`, {});
  }

  resetPassword(id: string, resetData: ResetPasswordDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/${id}/reset-password`, resetData);
  }

  getUserStats(): Observable<UserStatsDto> {
    return this.http.get<UserStatsDto>(`${this.API_URL}/stats`);
  }

  getAvailableRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/roles`);
  }
}