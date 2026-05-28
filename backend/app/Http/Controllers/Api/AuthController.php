<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate(['email'=>'required|email','password'=>'required|string']);
        $user = User::where('email',$data['email'])->active()->first();
        if (!$user || !Hash::check($data['password'],$user->password))
            throw ValidationException::withMessages(['email'=>['Credenciales incorrectas.']]);
        $user->update(['last_login_at'=>now()]);
        AuditLog::record('auth.login',$user->id,description:"Inicio de sesión");
        $token = $user->createToken('ofi-app')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user->only(['id','name','email','role','department','position','avatar_path'])]);
    }
    public function logout(Request $request): JsonResponse
    {
        AuditLog::record('auth.logout',$request->user()->id,description:"Cierre de sesión");
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Sesión cerrada.']);
    }
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}
